const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { URL_PATTERN } = require('../utils/constants');
const auth = require('../middlewares/auth');
const {
  getUsers,
  getUser,
  getCurrentUser,
  updateUserInfo,
  updateUserAvatar,
  // signup,
  // signin, // Импортируйте контроллер логина
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/me', auth, getCurrentUser);
router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().length(24).hex().required(),
  }),
}), getUser);
// router.post('/', signup);
// router.post('/login', signin); // Добавьте маршрут для логина
router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), updateUserInfo);
router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().pattern(URL_PATTERN),
  }),
}), updateUserAvatar);

module.exports = router;
