const winston = require('winston');

// Create a Winston logger instance with console and file transports
const logger = winston.createLogger({
  level: 'info', // Set the minimum level for all transports
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.printf(({ level, message, timestamp }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: './logs/debug.log' }),
    new winston.transports.File({
      filename: './logs/error.log',
      level: 'error',
    }),
  ],
});

module.exports = logger;
