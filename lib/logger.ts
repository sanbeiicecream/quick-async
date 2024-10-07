import path from 'node:path';
import winston from "winston";


// 自定义日志输出格式
const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${level}: ${message} -> ${timestamp} `;
});

const fileTransportError = new winston.transports.File({
  filename: path.join(process.cwd(), 'logs', 'error.log'),
  level: 'error',
  maxsize: 2 * 1024 * 1024,
  maxFiles: 2,
  zippedArchive: true
})

const fileTransportInfo = new winston.transports.File({
  filename: path.join(process.cwd(), 'logs', 'info.log'),
  level: 'info',
  maxsize: 1 * 1024 * 1024,
  maxFiles: 2,
  zippedArchive: true
})
// 创建一个日志记录器实例
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // 控制台输出日志
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),
    // 文件输出日志（错误日志）
    fileTransportError,
    // 文件输出日志（info日志）
    fileTransportInfo,
  ],
});

if (process.env.LOGGER === '0') {
  fileTransportError.silent = true
  fileTransportInfo.silent = true
  logger.warn('日志记录已关闭')
}

export default logger