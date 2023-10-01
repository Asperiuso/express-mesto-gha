const {
  FORBIDDEN,
} = require('../constants');

module.exports = class PermissionDenied extends Error {
  constructor(message) {
    super(message);
    this.statusCode = FORBIDDEN;
  }
};
