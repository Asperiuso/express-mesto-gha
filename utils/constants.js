const SECRET_KEY = 'YOUR_SECRET_KEY';
const URL_PATTERN = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9._~:/?#[\]@!$&'()*+,;=]+#?$/;

module.exports = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  FORBIDDEN: 403,
  UNAUTHORIZED: 401,
  CONFLICT: 409,
  OK_STATUS: 200,
  OK_CREATED: 201,
  SECRET_KEY,
  URL_PATTERN,
};
