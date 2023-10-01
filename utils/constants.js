const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const INTERNAL_SERVER_ERROR = 500;
const FORBIDDEN = 403;
const UNAUTHORIZED = 401;
const OK_STATUS = 200;
const OK_CREATED = 201;
const SECRET_KEY = 'YOUR_SECRET_KEY';
const URL_PATTERN = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9._~:/?#[\]@!$&'()*+,;=]+#?$/;

module.exports = {
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  FORBIDDEN,
  UNAUTHORIZED,
  SECRET_KEY,
  URL_PATTERN,
  OK_STATUS,
  OK_CREATED,
};
