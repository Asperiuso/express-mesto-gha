const express = require('express');
const mongoose = require('mongoose');

const { PORT = 3000, MONGODB_URI = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;
const app = express();
const dotenv = require('dotenv');
const { NOT_FOUND } = require('./utils/constants');

dotenv.config();
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
});

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Временное решение авторизации.
app.use((req, res, next) => {
  req.user = {
    _id: '6511ceb23b5e18f54bbb1160',
  };
  next();
});

app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

app.use((req, res) => {
  res.status(NOT_FOUND).send({ message: 'Путь не найден' });
});

app.listen(PORT, () => {
  console.log(`Сервер работает на PORT: ${PORT}`);
});
