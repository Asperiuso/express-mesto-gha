const { CastError, ValidationError, DocumentNotFoundError } = require('mongoose').Error;

const {
  OK_STATUS,
  OK_CREATED,
} = require('../utils/constants');

const Card = require('../models/card');

const BadRequest = require('../utils/errors/BadRequest');
const NotFoundError = require('../utils/errors/NotFound');
const PermissionDenied = require('../utils/errors/PermissionDenied');

module.exports.getCards = async (req, res, next) => {
  try {
    const cards = await Card.find({});
    res.status(OK_STATUS).send({ data: cards });
  } catch (err) {
    next(err);
  }
};

module.exports.createCard = async (req, res, next) => {
  const { name, link } = req.body;
  const userId = req.user._id;
  try {
    const card = await Card.create({ name, link, owner: userId });
    res.status(OK_CREATED).send({ data: card });
  } catch (err) {
    if (err instanceof ValidationError) {
      const badRequestError = new BadRequest('Некорректные данные в методе создания карточки');
      res.status(badRequestError.statusCode).send({ message: badRequestError.message });
      return;
    }
    next(err);
  }
};

module.exports.removeCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.cardId).orFail();
    // Проверка, является ли текущий пользователь владельцем карточки
    if (card.owner.toString() !== req.user._id.toString()) {
      const permissionDeniedError = new PermissionDenied('У вас нет прав на удаление этой карточки');
      res.status(permissionDeniedError.statusCode).send({ message: permissionDeniedError.message });
      return;
    }
    await card.remove();
    res.status(OK_STATUS).send({ data: card });
  } catch (err) {
    if (err instanceof CastError) {
      const badRequestError = new BadRequest(`Передан некорректный ID карточки: ${req.params.cardId}`);
      res.status(badRequestError.statusCode).send({ message: badRequestError.message });
      return;
    }
    if (err instanceof DocumentNotFoundError) {
      const notFoundError = new NotFoundError(`Запрашиваемая карточка с ID ${req.params.cardId} не найдена`);
      res.status(notFoundError.statusCode).send({ message: notFoundError.message });
      return;
    }
    next(err);
  }
};

module.exports.likeCard = async (req, res, next) => {
  const userId = req.user._id;
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: userId } },
      { new: true },
    ).orFail();
    res.status(OK_STATUS).send({ data: card });
  } catch (err) {
    if (err instanceof DocumentNotFoundError) {
      const notFoundError = new NotFoundError(`Запрашиваемая карточка с ID ${req.params.cardId} не найдена`);
      res.status(notFoundError.statusCode).send({ message: notFoundError.message });
      return;
    }
    if (err instanceof CastError) {
      const badRequestError = new BadRequest('Некорректные данные в методе проставления лайка');
      res.status(badRequestError.statusCode).send({ message: badRequestError.message });
      return;
    }
    next(err);
  }
};

module.exports.dislikeCard = async (req, res, next) => {
  const userId = req.user._id;
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: userId } },
      { new: true },
    ).orFail();
    res.status(OK_STATUS).send({ data: card });
  } catch (err) {
    if (err instanceof DocumentNotFoundError) {
      const notFoundError = new NotFoundError(`Запрашиваемая карточка с ID ${req.params.cardId} не найдена`);
      res.status(notFoundError.statusCode).send({ message: notFoundError.message });
      return;
    }
    if (err instanceof CastError) {
      const badRequestError = new BadRequest('Некорректные данные для метода снятия лайка');
      res.status(badRequestError.statusCode).send({ message: badRequestError.message });
      return;
    }
    next(err);
  }
};

module.exports.handleError = require('../middlewares/error-handler');
