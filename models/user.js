const mongoose = require('mongoose');
const validator = require('validator'); // Подключаем модуль validator

// Регулярное выражение для валидации URL
const urlPattern = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9._~:/?#[\]@!$&'()*+,;=]+#?$/;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Электронная почта должна быть уникальной
    validate: {
      // Используем валидатор для проверки формата электронной почты
      validator: (value) => validator.isEmail(value),
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
  },
  avatar: {
    type: String,
    required: true,
    validate: {
      validator: (value) => urlPattern.test(value),
      message: 'Некорректный формат ссылки на аватар',
    },
  },
});

module.exports = mongoose.model('user', userSchema);
