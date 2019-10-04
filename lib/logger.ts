import winston = require('winston');
import DailyRotateFile = require('winston-daily-rotate-file');

const logLevel = process.env.LOG_LEVEL || 'info';
const fileName = process.env.LOG_FILE_NAME || './logs/node-sdk-core.log';
let loggerDisabled = true;

// enable logger if any transport is set
if (process.env.ENABLE_ROTATING_FILE === 'true' || process.env.LOG_TO_CONSOLE === 'true' ||
process.env.LOG_FILE_NAME) {
  loggerDisabled = false;
}

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.json(),
  silent: loggerDisabled
});

// If flag is enabled then log to the `console`
if (process.env.LOG_TO_CONSOLE === 'true') {
  logger.add(new winston.transports.Console());
}
// If LOG_FILE_NAME is set, then log to specified file
if (process.env.LOG_FILE_NAME && !process.env.ENABLE_ROTATING_FILE) {
  const fileTransport = new winston.transports.File({ filename: fileName });
  logger.add(fileTransport);
}
// If flag is enabled then remove existing file transport & add rotating log file transport
else if (process.env.ENABLE_ROTATING_FILE === 'true') {
  logger.add(new DailyRotateFile({
    filename: fileName + '-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d'
  }));
}

export default logger;
