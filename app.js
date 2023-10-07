const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');

const { PORT = 3000, MONGODB_URI = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;

const auth = require('./middlewares/auth');
const errorHandler = require('./middlewares/error-handler');
const userRoute = require('./routes/users');
const cardRoute = require('./routes/cards');
const { createUser, login } = require('./controllers/users');
const { validationUser, validationLogin } = require('./utils/validation');
const NotFoundError = require('./utils/errors/NotFound');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const app = express();

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
});

app.use(cors({
  origin: [
    'http://localhost:3001',
    'https://mestox.nomoredomainsrocks.ru',
  ],
  credentials: true,
  methods: ['GET', 'PUT', 'POST', 'DELETE'],
  allowedHeaders: ['Authorization', 'Content-Type'],
}));

app.use(express.json());
app.use(cookieParser());

app.use(requestLogger);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post('/signin', validationLogin, login);
app.post('/signup', validationUser, createUser);

app.use(auth, userRoute);
app.use(auth, cardRoute);
app.use('*', auth, (req, res, next) => next(new NotFoundError('Страница не существует')));

app.use(errorLogger);

app.use(errors());

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Сервер работает на PORT: ${PORT}`);
});
