const { CastError, ValidationError, DocumentNotFoundError } = require('mongoose').Error;
const {
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  UNAUTHORIZED,
} = require('../utils/constants');
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
    if (err instanceof ValidationError) {
      res.status(BAD_REQUEST).send({ message: 'Некорректные данные в методе создания карточки' });
      return;
    }
    res.status(INTERNAL_SERVER_ERROR).send({ message: err.name });
  }
};

module.exports.removeCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.cardId).orFail();

    // Проверяем, что текущий пользователь является владельцем карточки
    if (card.owner.toString() !== req.user._id) {
      return res.status(UNAUTHORIZED).send({ message: 'У вас нет прав на удаление этой карточки' });
    }

    // Если проверка пройдена, удаляем карточку
    const removedCard = await Card.findByIdAndRemove(req.params.cardId).orFail();
    return res.send({ data: removedCard });
  } catch (err) {
    if (err instanceof CastError) {
      return res.status(BAD_REQUEST).send({ message: `Передан некорректный ID карточки: ${req.params.cardId}` });
    }
    if (err instanceof DocumentNotFoundError) {
      return res.status(NOT_FOUND).send({ message: `Запрашиваемая карточка с ID ${req.params.cardId} не найдена` });
    }
    return res.status(INTERNAL_SERVER_ERROR).send({ message: 'Запрос не может быть обработан' });
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
      res.status(BAD_REQUEST).send({ message: 'Некорректные данные в методе проставления лайка' });
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
      res.status(BAD_REQUEST).send({ message: 'Некорректные данные для метода снятия лайка' });
      return;
    }
    res.status(INTERNAL_SERVER_ERROR).send({ message: 'Запрос не может быть обработан' });
  }
};
