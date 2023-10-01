const { CastError, ValidationError, DocumentNotFoundError } = require('mongoose').Error;
const {
  OK_STATUS,
  OK_CREATED,
} = require('../utils/constants');
const Card = require('../models/card');

const NotFound = require('../utils/errors/NotFound');
const BadRequest = require('../utils/errors/BadRequest');
const PermissionDenied = require('../utils/errors/PermissionDenied');

module.exports.getCards = (req, res, next) => {
  Card.find({}).then((data) => res.status(OK_STATUS).send(data)).catch(next);
};

module.exports.removeCard = (req, res, next) => {
  Card.findById({ _id: req.params.cardId })
    .orFail()
    .then((data) => {
      if (!data.owner.equals(req.user._id)) {
        throw new PermissionDenied('Нет доступа');
      } else {
        Card.deleteOne({ _id: req.params.cardId }).then((card) => {
          res.status(OK_STATUS).send(card);
        });
      }
    })
    .catch((err) => {
      if (err instanceof DocumentNotFoundError) {
        next(new NotFound('Карточка не найдена'));
      } else if (err instanceof CastError) {
        next(new BadRequest('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const userId = req.user._id;

  Card.create({ name, link, owner: userId })
    .then((data) => res.status(OK_CREATED).send(data))
    .catch((err) => {
      if (err instanceof ValidationError) {
        next(new BadRequest('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

const updateCardLikedState = (req, res, next, query, httpCode) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    query,
    { new: true },
  ).orFail().then((data) => res.status(httpCode).send(data)).catch((err) => {
    if (err instanceof CastError) {
      next(new BadRequest('Переданы некорректные данные'));
    } else if (err instanceof DocumentNotFoundError) {
      next(new NotFound('Карточки не существует'));
    } else {
      next(err);
    }
  });
};

module.exports.likeCard = (req, res, next) => updateCardLikedState(req, res, next, {
  $addToSet: { likes: req.user._id },
}, OK_CREATED);

module.exports.dislikeCard = (req, res, next) => updateCardLikedState(req, res, next, {
  $pull: { likes: req.user._id },
}, OK_STATUS);
