const {
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  UNAUTHORIZED,
} = require('../utils/constants');

module.exports = (err, req, res) => {
  let status = INTERNAL_SERVER_ERROR; // По умолчанию, возвращаем 500 ошибку
  let message = 'На сервере произошла ошибка';

  if (err.code === 11000) {
    status = BAD_REQUEST;
    message = 'Пользователь с таким email уже существует';
  } else if (err.name === 'ValidationError') {
    status = BAD_REQUEST;
    message = 'Некорректные данные';
  } else if (err.name === 'CastError') {
    status = BAD_REQUEST;
    message = 'Передан некорректный ID';
  } else if (err.name === 'DocumentNotFoundError') {
    status = NOT_FOUND;
    message = 'Запрашиваемый ресурс не найден';
  } else if (err.name === 'JsonWebTokenError') {
    status = UNAUTHORIZED;
    message = 'Ошибка аутентификации';
  }

  res.status(status).send({ message });
};
