const {
  CONFLICT,
} = require('../constants');

module.exports = class Conflict extends Error {
  constructor(message) {
    super(message);
    this.statusCode = CONFLICT;
  }
};
