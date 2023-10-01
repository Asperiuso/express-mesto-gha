const {
  BAD_REQUEST,
} = require('../constants');

module.exports = class BadRequest extends Error {
  constructor(message) {
    super(message);
    this.statusCode = BAD_REQUEST;
  }
};
