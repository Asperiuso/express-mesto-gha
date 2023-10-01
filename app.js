const express = require('express');
const mongoose = require('mongoose');
const { celebrate, Joi } = require('celebrate');

const { PORT = 3000, MONGODB_URI = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;
const app = express();
const dotenv = require('dotenv');
const usersRouter = require('./routes/users');
const { NOT_FOUND, URL_PATTERN } = require('./utils/constants');
const auth = require('./middlewares/auth');
const errorHandler = require('./middlewares/error-handler');
const { signin, signup } = require('./controllers/users');

dotenv.config();
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
});

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
  }),
}), signin);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(URL_PATTERN),
  }),
}), signup);

app.use(auth);

app.use(express.json());
app.use('/users', usersRouter);
app.use(express.urlencoded({ extended: true }));

app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

app.use((req, res) => {
  res.status(NOT_FOUND).send({ message: 'Путь не найден' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Сервер работает на PORT: ${PORT}`);
});
