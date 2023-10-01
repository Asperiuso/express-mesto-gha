const {
  UNAUTHORIZED,
} = require('../constants');

module.exports = class Unauthorized extends Error {
  constructor(message) {
    super(message);
    this.statusCode = UNAUTHORIZED;
  }
};
