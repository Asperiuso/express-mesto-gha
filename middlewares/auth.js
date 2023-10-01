const jwt = require('jsonwebtoken');
const { UNAUTHORIZED, SECRET_KEY } = require('../utils/constants');

module.exports = (req, res, next) => {
  // Проверяем, есть ли токен в заголовках запроса
  const token = req.headers;

  if (!token) {
    return res.status(UNAUTHORIZED).send({ message: 'Необходима авторизация' });
  }

  let payload;

  try {
    // Пытаемся верифицировать токен
    payload = jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return res.status(UNAUTHORIZED).send({ message: 'Необходима авторизация' });
  }

  // Если токен верен, добавляем пейлоуд в объект запроса
  req.user = payload;

  return next();
};
