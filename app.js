const express = require('express');
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

const app = express();

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.post('/signin', validationLogin, login);
app.post('/signup', validationUser, createUser);

app.use(auth, userRoute);
app.use(auth, cardRoute);
app.use('*', auth, (req, res, next) => next(new NotFoundError('Страница не существует')));

app.use(errors());

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Сервер работает на PORT: ${PORT}`);
});
