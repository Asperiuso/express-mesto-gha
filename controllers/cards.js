const { CastError, DocumentNotFoundError } = require('mongoose').Error;
const { BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR } = require('../utils/constants');
const Card = require('../models/card');

module.exports.getCards = async (req, res) => {
  try {
    const cards = await Card.find({});
    res.send({ data: cards });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).send({ message: 'Ошибка при запросе карточек' });
  }
};

module.exports.createCard = async (req, res) => {
  const { name, link } = req.body;
  const userId = req.user._id;

  try {
    const card = await Card.create({ name, link, owner: userId });
    res.send({ data: card });
  } catch (err) {
    res.status(INTERNAL_SERVER_ERROR).send({ message: err.name });
  }
};

module.exports.removeCard = async (req, res) => {
  try {
    const card = await Card.findByIdAndRemove(req.params.cardId).orFail();
    res.send({ data: card });
  } catch (err) {
    if (err instanceof CastError) {
      res.status(BAD_REQUEST).send({ message: `Передан некорректный ID карточки: ${req.params.cardId}` });
      return;
    }
    if (err instanceof DocumentNotFoundError) {
      res.status(NOT_FOUND).send({ message: `Запрашиваемая карточка с ID ${req.params.cardId} не найдена` });
      return;
    }
    res.status(INTERNAL_SERVER_ERROR).send({ message: 'Запрос не может быть обработан' });
  }
};

module.exports.likeCard = async (req, res) => {
  const userId = req.user._id;

  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: userId } },
      { new: true },
    ).orFail();
    res.send({ data: card });
  } catch (err) {
    if (err instanceof DocumentNotFoundError) {
      res.status(NOT_FOUND).send({ message: `Запрашиваемая карточка с ID ${req.params.cardId} не найдена` });
      return;
    }
    if (err instanceof CastError) {
      res.status(BAD_REQUEST).send({ message: `Передан некорректный ID карточки: ${req.params.cardId}` });
      return;
    }
    res.status(INTERNAL_SERVER_ERROR).send({ message: 'Запрос не может быть обработан' });
  }
};

module.exports.dislikeCard = async (req, res) => {
  const userId = req.user._id;

  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: userId } },
      { new: true },
    ).orFail();
    res.send({ data: card });
  } catch (err) {
    if (err instanceof DocumentNotFoundError) {
      res.status(NOT_FOUND).send({ message: `Запрашиваемая карточка с ID ${req.params.cardId} не найдена` });
      return;
    }
    if (err instanceof CastError) {
      res.status(BAD_REQUEST).send({ message: `Передан некорректный ID карточки: ${req.params.cardId}` });
      return;
    }
    res.status(INTERNAL_SERVER_ERROR).send({ message: 'Запрос не может быть обработан' });
  }
};
