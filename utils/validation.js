const { celebrate, Joi } = require('celebrate');
const { URL_PATTERN } = require('./constants');

module.exports.validationLogin = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
});

module.exports.validationUser = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().regex(URL_PATTERN),
  }),
});

module.exports.validationProfile = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
});

module.exports.validationAvatar = celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().regex(URL_PATTERN),
  }),
});

module.exports.validationCard = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().regex(URL_PATTERN),
  }),
});

const cardIdJoi = { cardId: Joi.string().length(24).hex().required() };

module.exports.validationDeleteCard = celebrate({
  params: Joi.object().keys(cardIdJoi),
});

module.exports.validationAddLike = celebrate({
  params: Joi.object().keys(cardIdJoi),
});

module.exports.validationDeleteLike = celebrate({
  params: Joi.object().keys(cardIdJoi),
});

module.exports.validationId = celebrate({
  params: Joi.object().keys({
    id: Joi.string().length(24).hex(),
  }),
});
