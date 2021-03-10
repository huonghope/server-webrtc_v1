const winston = require('winston');
require('winston-daily-rotate-file');
const moment =require('moment')


dateFormat = () => {
  const currentTime = moment().format('DD/MM/YYYY dddd HH:mm:ss')
  return currentTime
}

class LoggerService{
  constructor(route){
    this.logData = null
    this.route = route
    const logger = winston.createLogger({
      format: winston.format.combine(
        // winston.format.colorize(),
        winston.format.printf((info) => {
          let message = `${dateFormat()} | ${info.level.toUpperCase()} | ${route}.log | ${info.message} | `
          message = info.object ? message + `DATA: ${JSON.stringify(info.object)} | ` : message
          message = this.logData ? message + `LOG_DATA: ${JSON.stringify(this.logData)} | ` : message
          return message
        })
      ),
      transports: [
        new winston.transports.DailyRotateFile({
          filename: 'log/%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          prepend: true,
          // maxsize: 5120000,
          // maxFiles: 5,
        }),
      ]
    })
    this.logger = logger
    
    //production not console
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
          }),
          winston.format.align(),
          winston.format.printf(log =>  
            {
              if(log.stack) return `[${log.timestamp}] [${log.level}] ${log.stack}`;
                return  `[${log.timestamp}] [${log.level}] ${log.message}`;
            }),
        ),
        level: 'debug'
      }));
    }
  }
  setLogData (logData){
    this.logData = logData
  }
  async info(message, object = null){
    this.logger.log('info', message,  {object} )
  }
  async debug(message, object = null){
    this.logger.log('debug', message, {object} )
  }
  async error(message, object = null){
    this.logger.log('error', message,  {object} )
  }
}

module.exports = LoggerService;
