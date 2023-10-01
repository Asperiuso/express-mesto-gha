const { CastError, DocumentNotFoundError } = require('mongoose').Error;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OK_STATUS, OK_CREATED, SECRET_KEY } = require('../utils/constants');
const User = require('../models/user');
const Conflict = require('../utils/errors/Conflict');
const BadRequest = require('../utils/errors/BadRequest');
const Unauthorized = require('../utils/errors/Unauthorized');
const NotFound = require('../utils/errors/NotFound');

module.exports.signin = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .orFail()
    .then((user) => {
      bcrypt.compare(password, user.password, (err, result) => {
        if (!result) {
          next(new Unauthorized('Неправильный email или пароль'));
        } else {
          const token = jwt.sign({ _id: user._id }, SECRET_KEY, { expiresIn: '7d' });

          // отправим токен, браузер сохранит его в куках
          res.cookie('jwt', token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
          }).send({ token });
        }
      });
    })
    .catch((err) => {
      if (err instanceof DocumentNotFoundError) {
        next(new Unauthorized('Неправильный email или пароль'));
      } else if (err instanceof CastError) {
        next(new BadRequest('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};
module.exports.signup = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then(() => res.status(OK_CREATED).send({
      name,
      about,
      avatar,
      email,
    }))
    .catch((err) => {
      if (err.code === 11000) {
        return next(new Conflict('Email уже зарегистрирован'));
      }
      if (err instanceof Error) {
        return next(new BadRequest('Переданы некорректные данные'));
      }
      return next(err);
    });
};

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(OK_STATUS).send(users))
    .catch((err) => next(err));
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findOne({ _id: req.user._id })
    .orFail()
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        return next(new NotFound('Пользователь не найден'));
      }
      if (err instanceof Error) {
        return next(new BadRequest('Переданы некорректные данные'));
      }
      return next(err);
    });
};

module.exports.getUser = (req, res, next) => {
  User.findOne({ _id: req.params.userId })
    .orFail()
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        return next(new NotFound('Пользователь не найден'));
      }
      if (err instanceof Error) {
        return next(new BadRequest('Переданы некорректные данные'));
      }
      return next(err);
    });
};

const updateUserInfo = (req, res, next, data) => {
  User.findOneAndUpdate({ _id: req.user._id }, data, {
    new: true,
    runValidators: true,
  })
    .orFail()
    .then((user) => res.status(OK_STATUS).send(user))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        return next(new NotFound('Пользователь не найден'));
      }
      if (err instanceof Error) {
        return next(new BadRequest('Переданы некорректные данные'));
      }
      return next(err);
    });
};

module.exports.updateUserInfo = (req, res, next) => {
  const { name, about } = req.body;
  return updateUserInfo(req, res, next, { name, about });
};

module.exports.updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;
  return updateUserInfo(req, res, next, { avatar });
};
