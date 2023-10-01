const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { CastError, ValidationError, DocumentNotFoundError } = require('mongoose').Error;

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

module.exports.createUser = async (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      about,
      avatar,
      email,
      password: hashedPassword,
    });
    res.status(OK_CREATED).send({
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      email: user.email,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return next(new BadRequestError('Переданы некорректные данные'));
    }
    if (err.code === 11000) {
      return next(new ConflictError('Пользователь уже существует'));
    }
    next(err);
  }
  return undefined;
};

module.exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new UnauthorizedError('Неправильные почта или пароль');
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedError('Неправильные почта или пароль');
    }
    const token = jwt.sign({ _id: user._id }, SECRET_KEY, { expiresIn: '7d' });
    res.cookie('jwt', token, { maxAge: 3600000 * 24 * 7, httpOnly: true, sameSite: true });
    res.status(OK_STATUS).send({ token });
  } catch (err) {
    next(err);
  }
};

module.exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.status(OK_STATUS).send({ data: users });
  } catch (err) {
    next(err);
  }
};

module.exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).orFail();
    res.status(OK_STATUS).send({ data: user });
  } catch (err) {
    if (err instanceof CastError) {
      const badRequestError = new BadRequestError(`Передан некорректный ID пользователя: ${req.params.userId}`);
      res.status(badRequestError.statusCode).send({ message: badRequestError.message });
    } else if (err instanceof DocumentNotFoundError) {
      const notFoundError = new NotFoundError(`Запрашиваемый пользователь c ID ${req.params.userId} не найден`);
      res.status(notFoundError.statusCode).send({ message: notFoundError.message });
    } else {
      next(err);
    }
  }
};

module.exports.createUser = async (req, res, next) => {
  const { name, about, avatar } = req.body;
  try {
    const user = await User.create({ name, about, avatar });
    res.status(OK_CREATED).send({ data: user });
  } catch (err) {
    if (err instanceof ValidationError) {
      const badRequestError = new BadRequestError('Некорректные данные в методе создания пользователя');
      res.status(badRequestError.statusCode).send({ message: badRequestError.message });
    } else {
      next(err);
    }
  }
};

module.exports.updateUserInfo = async (req, res, next) => {
  const userId = req.user._id;
  const { name, about } = req.body;
  try {
    /* eslint-disable max-len */
    const user = await User.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true }).orFail();
    /* eslint-enable max-len */
    res.status(OK_STATUS).send({ data: user });
  } catch (err) {
    if (err instanceof DocumentNotFoundError) {
      const notFoundError = new NotFoundError(`Запрашиваемый пользователь c ID ${userId} не найден`);
      res.status(notFoundError.statusCode).send({ message: notFoundError.message });
    } else if (err instanceof ValidationError) {
      const badRequestError = new BadRequestError('Некорректные данные в методе обнавления профиля');
      res.status(badRequestError.statusCode).send({ message: badRequestError.message });
    } else {
      next(err);
    }
  }
};

module.exports.updateUserAvatar = async (req, res, next) => {
  const userId = req.user._id;
  const { avatar } = req.body;
  try {
    /* eslint-disable max-len */
    const user = await User.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true }).orFail();
    /* eslint-enable max-len */
    res.status(OK_STATUS).send({ data: user });
  } catch (err) {
    if (err instanceof DocumentNotFoundError) {
      const notFoundError = new NotFoundError(`Запрашиваемый пользователь c ID ${userId} не найден`);
      res.status(notFoundError.statusCode).send({ message: notFoundError.message });
    } else if (err instanceof ValidationError) {
      const badRequestError = new BadRequestError('Некорректные данные в методе обновления аватара');
      res.status(badRequestError.statusCode).send({ message: badRequestError.message });
    } else {
      next(err);
    }
  }
};

module.exports.handleError = require('../middlewares/error-handler');
