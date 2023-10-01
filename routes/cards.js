const router = require('express').Router();
const { body, param } = require('express-validator');
const {
  getCards,
  createCard,
  removeCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

// Middleware для валидации данных при создании карточки
const validateCardData = [
  body('name').isString().withMessage('Имя должно быть строкой'),
  body('link').isURL().withMessage('Ссылка должна быть валидным URL'),
];

// Middleware для валидации параметра cardId
const validateCardId = [
  param('cardId').isMongoId().withMessage('Некорректный ID карточки'),
];

router.get('/', getCards);
router.post('/', validateCardData, createCard);
router.delete('/:cardId', validateCardId, removeCard);
router.put('/:cardId/likes', validateCardId, likeCard);
router.delete('/:cardId/likes', validateCardId, dislikeCard);

module.exports = router;