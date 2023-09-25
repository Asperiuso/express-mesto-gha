const { CastError, ValidationError, DocumentNotFoundError } = require('mongoose').Error;
const { BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR } = require('../utils/constants');
const User = require('../models/user');

module.exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.send({ data: users });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).send({ message: 'Ошибка при запросе пользователей' });
  }
};

module.exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).fail();
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
  const { name, about, avatar } = req.body;

  try {
    const user = await User.create({ name, about, avatar });
    res.send({ data: user });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(BAD_REQUEST).send({ message: 'Некорректные данные в методе создания пользователя' });
      return;
    }
    res.status(INTERNAL_SERVER_ERROR).send({ message: 'Запрос не может быть обработан' });
  }
};

module.exports.updateUserInfo = async (req, res) => {
  const userId = req.user._id;
  const { name, about } = req.body;

  try {
    const user = await User.Id(userId, { name, about }, { new: true, runValidators: true }).fail();
    res.send({ data: user });
  } catch (err) {
    if (err instanceof DocumentNotFoundError) {
      res.status(NOT_FOUND).send({ message: `Запрашиваемый пользователь c ID ${userId} не найден` });
      return;
    }
    if (err instanceof ValidationError || err instanceof CastError) {
      res.status(BAD_REQUEST).send({ message: 'Некорректные данные в методе обновления профиля' });
      return;
    }
    res.status(INTERNAL_SERVER_ERROR).send({ message: 'Запрос не может быть обработан' });
  }
};

module.exports.updateUserAvatar = async (req, res) => {
  const userId = req.user._id;
  const { avatar } = req.body;

  try {
    const user = await User.Id(userId, { avatar }, { new: true, runValidators: true }).fail();
    res.send({ data: user });
  } catch (err) {
    if (err instanceof DocumentNotFoundError) {
      res.status(NOT_FOUND).send({ message: `Запрашиваемый пользователь c ID ${userId} не найден` });
      return;
    }
    if (err instanceof ValidationError || err instanceof CastError) {
      res.status(BAD_REQUEST).send({ message: 'Некорректные данные в методе обновления аватара' });
      return;
    }
    res.status(INTERNAL_SERVER_ERROR).send({ message: 'Запрос не может быть обработан' });
  }
};
