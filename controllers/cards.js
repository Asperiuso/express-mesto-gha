const { OK_STATUS, OK_CREATED } = require('../utils/constants');
const Card = require('../models/card');
const PermissionDenied = require('../utils/errors/PermissionDenied');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((data) => res.status(OK_STATUS).send(data))
    .catch(next); // Обработка ошибок передана в middleware
};

module.exports.removeCard = (req, res, next) => {
  Card.findById({ _id: req.params.cardId })
    .orFail()
    .then((data) => {
      if (!data.owner.equals(req.user._id)) {
        throw new PermissionDenied('Отказано в доступе');
      } else {
        Card.deleteOne({ _id: req.params.cardId }).then((card) => {
          res.status(OK_STATUS).send(card);
        });
      }
    })
    .catch(next); // Обработка ошибок передана в middleware
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const userId = req.user._id;

  Card.create({ name, link, owner: userId })
    .then((data) => res.status(OK_CREATED).send(data))
    .catch(next); // Обработка ошибок передана в middleware
};

const updateCardLikedState = (req, res, next, query, httpCode) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    query,
    { new: true },
  )
    .orFail()
    .then((data) => res.status(httpCode).send(data))
    .catch(next); // Обработка ошибок передана в middleware
};

module.exports.likeCard = (req, res, next) => updateCardLikedState(req, res, next, { $addToSet: { likes: req.user._id } }, OK_CREATED);

module.exports.dislikeCard = (req, res, next) => updateCardLikedState(req, res, next, { $pull: { likes: req.user._id } }, OK_STATUS);
