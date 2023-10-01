const express = require('express');
const mongoose = require('mongoose');
const { validationResult, body } = require('express-validator');

const { PORT = 3000, MONGODB_URI = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;
const app = express();
const dotenv = require('dotenv');
const usersRouter = require('./routes/users');
const { NOT_FOUND } = require('./utils/constants');
const auth = require('./middlewares/auth');
const errorHandler = require('./middlewares/error-handler');
const { login, createUser } = require('./controllers/users');

dotenv.config();
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
});

app.use(auth);

app.use(express.json());
app.use('/users', usersRouter);
app.use(express.urlencoded({ extended: true }));

// Валидация запросов для /signin и /signup
app.post(
  '/signin',
  [
    body('email').isEmail().withMessage('Некорректный формат email'),
    body('password').isLength({ min: 6 }).withMessage('Пароль должен содержать минимум 6 символов'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    return next();
  },
);

app.post(
  '/signup',
  [
    body('email').isEmail().withMessage('Некорректный формат email'),
    body('password').isLength({ min: 6 }).withMessage('Пароль должен содержать минимум 6 символов'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    return next();
  },
);

app.post('/signin', login);
app.post('/signup', createUser);

app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

app.use((req, res) => {
  res.status(NOT_FOUND).send({ message: 'Путь не найден' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Сервер работает на PORT: ${PORT}`);
});
