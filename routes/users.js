const router = require('express').Router();

const {
  getUsers,
  getUser,
  updateUserInfo,
  updateUserAvatar,
} = require('../controllers/users');
const { validationProfile, validationId, validationAvatar } = require('../utils/validation');

router.get('/users', getUsers);
router.get('/users/me', getUser);
router.get('/users/:id', validationId, getUser);
router.patch('/users/me', validationProfile, updateUserInfo);
router.patch('/users/me/avatar', validationAvatar, updateUserAvatar);

module.exports = router;
