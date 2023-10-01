const {
  NOT_FOUND,
} = require('../constants');

module.exports = class NotFound extends Error {
  constructor(message) {
    super(message);
    this.statusCode = NOT_FOUND;
  }
};
