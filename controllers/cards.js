const {
  OK_STATUS,
  OK_CREATED,
} = require('../utils/constants');

const Card = require('../models/card');

const BadRequest = require('../utils/errors/BadRequest');
const NotFoundError = require('../utils/errors/NotFound');
const PermissionDenied = require('../utils/errors/PermissionDenied');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.status(OK_STATUS).send(cards))
    .catch((err) => next(err));
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(OK_CREATED).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequest('Некорректные данные в методе создания карточки'));
      }
      return next(err);
    });
};

module.exports.removeCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        return next(new NotFoundError('Карточка с указанным _id не найдена'));
      }
      if (JSON.stringify(card.owner) !== JSON.stringify(req.user._id)) {
        return next(new PermissionDenied('У вас нет прав на удаление этой карточки'));
      }
      return Card.findByIdAndDelete(req.params.cardId);
    })
    .then((card) => {
      res.status(OK_STATUS).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequest(`Передан некорректный ID карточки: ${req.params.cardId}`));
      }
      return next(err);
    });
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        return next(new NotFoundError(`Запрашиваемая карточка с ID ${req.params.cardId} не найдена`));
      }
      return res.status(OK_STATUS).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequest('Некорректные данные в методе проставления лайка'));
      }
      return next(err);
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        return next(new NotFoundError(`Запрашиваемая карточка с ID ${req.params.cardId} не найдена`));
      }
      return res.status(OK_STATUS).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequest('Некорректные данные для метода снятия лайка'));
      }
      return next(err);
    });
};
