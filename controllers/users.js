const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { CastError, DocumentNotFoundError } = require('mongoose').Error;
const {
  BAD_REQUEST,
  NOT_FOUND,
  UNAUTHORIZED,
  INTERNAL_SERVER_ERROR,
} = require('../utils/constants');

const User = require('../models/user');

module.exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(UNAUTHORIZED).send({ message: 'Неправильные почта или пароль' });
    }

    const token = jwt.sign({ _id: user._id }, '259f0c489d8b65197882c5faa2e5dcc026be7d1ecb88153c87e5ac53b09f392f', { expiresIn: '7d' });

    res.cookie('jwt', token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'strict',
    });

    return res.send({ message: 'Авторизация прошла успешно' });
  } catch (err) {
    return res.status(INTERNAL_SERVER_ERROR).send({ message: 'Ошибка при попытке авторизации' });
  }
};

module.exports.getCurrentUser = (req, res) => {
  res.send({ data: req.user });
};

module.exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    return res.send({ data: users });
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).send({ message: 'Ошибка при запросе пользователей' });
  }
};

module.exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).orFail();
    res.send({ data: user });
  } catch (err) {
    if (err instanceof CastError) {
      res.status(BAD_REQUEST).send({ message: `Передан некорректный ID пользователя: ${req.params.userId}` });
      return;
    }
    if (err instanceof DocumentNotFoundError) {
      res.status(NOT_FOUND).send({ message: `Запрашиваемый пользователь c ID ${req.params.userId} не найден` });
      return;
    }
    res.status(INTERNAL_SERVER_ERROR).send({ message: 'Запрос не может быть обработан' });
  }
};

module.exports.createUser = async (req, res) => {
  const {
    name = 'Жак-Ив Кусто',
    about = 'Исследователь',
    avatar = 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
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

    return res.send({ data: user });
  } catch (err) {
    if (err instanceof validationResult) {
      return res.status(BAD_REQUEST).send({ message: 'Некорректные данные в методе создания пользователя' });
    }
    return res.status(INTERNAL_SERVER_ERROR).send({ message: 'Запрос не может быть обработан' });
  }
};

module.exports.updateUserInfo = async (req, res) => {
  const userId = req.user._id;
  const { name, about } = req.body;

  try {
    const user = await User.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true }).orFail();
    res.send({ data: user });
  } catch (err) {
    if (err instanceof DocumentNotFoundError) {
      res.status(NOT_FOUND).send({ message: `Запрашиваемый пользователь c ID ${userId} не найден` });
    } else if (err instanceof validationResult) {
      res.status(BAD_REQUEST).send({ message: 'Некорректные данные в методе обновления профиля' });
    } else {
      res.status(INTERNAL_SERVER_ERROR).send({ message: 'Запрос не может быть обработан' });
    }
  }
};

module.exports.updateUserAvatar = async (req, res) => {
  const userId = req.user._id;
  const { avatar } = req.body;

  try {
    const user = await User.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true }).orFail();
    res.send({ data: user });
  } catch (err) {
    if (err instanceof DocumentNotFoundError) {
      res.status(NOT_FOUND).send({ message: `Запрашиваемый пользователь c ID ${userId} не найден` });
    } else if (err instanceof validationResult) {
      res.status(BAD_REQUEST).send({ message: 'Некорректные данные в методе обновления аватара' });
    } else {
      res.status(INTERNAL_SERVER_ERROR).send({ message: 'Запрос не может быть обработан' });
    }
  }
};
