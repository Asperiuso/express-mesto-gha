const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Временное решение авторизации.
app.use((req, res, next) => {
  req.user = {
    _id: '6511ceb23b5e18f54bbb1160',
  };

  next();
});

app.use(process.env.USERS_ROUTE, require('./routes/users'));
app.use(process.env.CARDS_ROUTE, require('./routes/cards'));

app.use((req, res) => {
  res.status(process.env.NOT_FOUND).send({ message: 'Путь не найден' });
});

app.listen(process.env.PORT, () => {
  console.log(`Сервер работает на PORT: ${process.env.PORT}`);
});
