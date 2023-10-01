const jwt = require('jsonwebtoken');
const Unauthorized = require('../utils/errors/Unauthorized');
const { SECRET_KEY } = require('../utils/constants');

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;
  let payload;
  try {
    payload = jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return next(new Unauthorized('Необходима авторизация'));
  }
  req.user = payload;

  return next();
};
