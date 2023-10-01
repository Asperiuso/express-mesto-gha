const { CastError, ValidationError, DocumentNotFoundError } = require('mongoose').Error;
const {
  UNAUTHORIZED,
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  BAD_REQUEST,
  NOT_FOUND,
} = require('../utils/constants');

const PermissionDenied = require('../utils/errors/PermissionDenied');
const Unauthorized = require('../utils/errors/Unauthorized');
const ConflictError = require('../utils/errors/Conflict');

const errorHandler = (err, req, res, next) => {
  let status = INTERNAL_SERVER_ERROR;
  let message = 'На сервере произошла ошибка';

  if (err instanceof DocumentNotFoundError) {
    status = NOT_FOUND;
    message = 'Ресурс не найден';
  } else if (err instanceof CastError) {
    status = BAD_REQUEST;
    message = 'Переданы некорректные данные';
  } else if (err instanceof ValidationError) {
    status = BAD_REQUEST;
    message = 'Некорректные данные';
  } else if (err instanceof PermissionDenied) {
    status = UNAUTHORIZED;
    message = 'Отказано в доступе';
  } else if (err instanceof Unauthorized) {
    status = UNAUTHORIZED;
    message = 'Необходима авторизация';
  } else if (err instanceof ConflictError) {
    status = CONFLICT;
    message = 'Пользователь с таким email уже существует';
  }

  res.status(status).send({ message });
  return next(err);
};

module.exports = errorHandler;
