const winston = require('winston');
const expressWinston = require('express-winston');

// Уровень журналирования (по умолчанию, 'info')
const logLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

// Создание и настройка логгера для запросов
const requestLogger = expressWinston.logger({
  transports: [
    new winston.transports.File({ filename: 'request.log', level: 'info' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
      level: logLevel,
    }),
  ],
  format: winston.format.json(),
  meta: true, // Включение мета-данных (например, URL запроса)
  expressFormat: true, // Форматирование сообщений, чтобы они соответствовали журналам Express
});

// Создание и настройка логгера для ошибок
const errorLogger = expressWinston.errorLogger({
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
      level: logLevel,
    }),
  ],
  format: winston.format.json(),
});

module.exports = {
  requestLogger,
  errorLogger,
};
