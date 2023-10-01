const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const ConflictError = require('../utils/errors/Conflict');
const BadRequestError = require('../utils/errors/BadRequest');
const UnauthorizedError = require('../utils/errors/Unauthorized');
const NotFoundError = require('../utils/errors/NotFound');

const {
  SECRET_KEY,
  OK_CREATED,
  OK_STATUS,
} = require('../utils/constants');

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => res.status(OK_CREATED).send({
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      email: user.email,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные'));
      }
      if (err.code === 11000) {
        return next(new ConflictError('Пользователь уже существует'));
      }
      return next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return next(new UnauthorizedError('Неправильные почта или пароль'));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return next(new UnauthorizedError('Неправильные почта или пароль'));
          }
          const token = jwt.sign({ _id: user._id }, SECRET_KEY, { expiresIn: '7d' });
          res.cookie('jwt', token, { maxAge: 3600000 * 24 * 7, httpOnly: true, sameSite: true });
          return res.status(OK_STATUS).send({ token });
        });
    })
    .catch((err) => next(err));
};

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(OK_STATUS).send(users))
    .catch((err) => next(err));
};

module.exports.getUser = (req, res, next) => {
  let userId;
  if (req.params.id) {
    userId = req.params.id;
  } else {
    userId = req.user._id;
  }
  User.findById(userId)
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('Пользователь по указанному _id не найден'));
      }
      return res.status(OK_STATUS).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Переданы некоректные данные'));
      }
      return next(err);
    });
};

module.exports.updateUserInfo = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .then((user) => res.status(OK_STATUS).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные'));
      }
      return next(err);
    });
};

module.exports.updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then((user) => res.status(OK_STATUS).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные'));
      }
      return next(err);
    });
};

module.exports.handleError = require('../middlewares/error-handler');
