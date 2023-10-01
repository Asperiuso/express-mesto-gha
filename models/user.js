const mongoose = require('mongoose');
const validator = require('validator'); // Подключаем модуль validator
const { URL_PATTERN } = require('../utils/constants');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
    default: 'Жак-Ив Кусто',
  },
  email: {
    type: String,
    required: true,
    unique: true, // Электронная почта должна быть уникальной
    validate: {
      // Используем валидатор для проверки формата электронной почты
      validator: (email) => validator.isEmail(email),
      message: 'Некорректный формат email',
    },
  },
  password: {
    type: String,
    required: true,
    select: false, // Это поле не будет возвращено по умолчанию
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    required: true,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator: (url) => URL_PATTERN.test(url),
      message: 'Некорректный формат ссылки на аватар',
    },
  },
});

module.exports = mongoose.model('user', userSchema);
