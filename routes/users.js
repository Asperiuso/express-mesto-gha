const router = require('express').Router();
const { getCurrentUser } = require('../controllers/users');
const auth = require('../middlewares/auth');
const {
  getUsers,
  getUser,
  createUser,
  updateUserInfo,
  updateUserAvatar,
  login, // Импортируйте контроллер логина
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/:userId', getUser);
router.post('/', createUser);
router.post('/login', login); // Добавьте маршрут для логина
router.patch('/me', updateUserInfo);
router.patch('/me/avatar', updateUserAvatar);
router.get('/me', auth, getCurrentUser);

module.exports = router;
