const jwt = require('jsonwebtoken');
const { UNAUTHORIZED } = require('../utils/constants');
// eslint-disable-next-line
module.exports = (req, res, next) => {
  // Проверяем, есть ли токен в заголовках запроса
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(UNAUTHORIZED).send({ message: 'Необходима авторизация' });
  }

  const token = authorization.replace('Bearer ', '');

  let payload;

  try {
    // Пытаемся верифицировать токен
    payload = jwt.verify(token, '259f0c489d8b65197882c5faa2e5dcc026be7d1ecb88153c87e5ac53b09f392f');
  } catch (err) {
    return res.status(UNAUTHORIZED).send({ message: 'Необходима авторизация' });
  }

  // Если токен верен, добавляем пейлоуд в объект запроса
  req.user = payload;
  next();
};
