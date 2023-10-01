const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  UNAUTHORIZED,
  SECRET_KEY,
} = require('../utils/constants');
const User = require('../models/user');

module.exports.createUser = async (req, res) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      about,
      avatar,
      email,
      password: hashedPassword,
    });
    res.send({ data: user });
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(BAD_REQUEST).send({ message: 'Некорректные данные в методе создания пользователя' });
    } else {
      res.status(INTERNAL_SERVER_ERROR).send({ message: 'Запрос не может быть обработан' });
    }
  }
};

module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(UNAUTHORIZED).send({ message: 'Неправильные почта или пароль' });
      return;
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(UNAUTHORIZED).send({ message: 'Неправильные почта или пароль' });
      return;
    }
    const token = jwt.sign({ _id: user._id }, SECRET_KEY, { expiresIn: '7d' });
    // токен в cookie
    res.cookie('jwt', token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // Время жизни токена в миллисекундах (7 дней)
      httpOnly: true,
      secure: true,
    });
    res.send({ token });
  } catch (err) {
    res.status(INTERNAL_SERVER_ERROR).send({ message: 'Запрос не может быть обработан' });
  }
};
