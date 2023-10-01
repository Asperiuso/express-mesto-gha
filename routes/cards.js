const router = require('express').Router();
const {
  getCards,
  createCard,
  removeCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

const {
  validationCard,
  validationDeleteCard,
  validationAddLike,
  validationDeleteLike,
} = require('../utils/validation');

router.get('/cards', getCards);
router.post('/cards', validationCard, createCard);
router.delete('/cards/:cardId', validationDeleteCard, removeCard);
router.put('/cards/:cardId/likes', validationAddLike, likeCard);
router.delete('/cards/:cardId/likes', validationDeleteLike, dislikeCard);

module.exports = router;
