const winston = require('winston');
require('winston-daily-rotate-file');
const moment =require('moment');


dateFormat = () => {
  // const currentTime = moment().format('DD/MM/YYYY dddd HH:mm:ss');
  const currentTime = new Date();
  var datestring = ("0" + currentTime.getDate()).slice(-2) + "-" + 
  ("0"+(currentTime.getMonth()+1)).slice(-2) + "-" +
  currentTime.getFullYear() + " " + 
  ("0" + currentTime.getHours()).slice(-2) + ":" + 
  ("0" + currentTime.getMinutes()).slice(-2) + ":" + 
  ("0" + currentTime.getSeconds()).slice(-2) + ":" + 
  ("0" + currentTime.getMilliseconds());
  
  return datestring;
};

class LoggerSpeaker {
  constructor(roomId, timer) {
    this.logData = null;
    this.roomId = roomId;
    this.timer = timer;

    const logger = winston.createLogger({
      format: winston.format.combine(
          // winston.format.colorize(),
          winston.format.printf((info) => {
            let message = `${dateFormat()} | ${this.timer} |${info.level.toUpperCase()} | ${JSON.stringify(info.object)}`;
            return message;
          }),
      ),
      transports: [
        new winston.transports.DailyRotateFile({
          filename: `speaker/%DATE%/${this.roomId}.log`,
          datePattern: 'YYYY-MM-DD',
          prepend: true,
          // maxsize: 5120000,
          // maxFiles: 5,
        }),
      ],
    });
    this.logger = logger;

    // // production not console
    // if (process.env.NODE_ENV !== 'production') {
    //   this.logger.add(new winston.transports.Console({
    //     format: winston.format.combine(
    //         winston.format.colorize(),
    //         winston.format.timestamp({
    //           format: 'YYYY-MM-DD HH:mm:ss',
    //         }),
    //         winston.format.align(),
    //         winston.format.printf((log) =>
    //         {
    //           if (log.stack) return `[${log.timestamp}] [${log.level}] ${log.stack}`;
    //           return `[${log.timestamp}] [${log.level}] ${log.message}`;
    //         }),
    //     ),
    //     level: 'debug',
    //   }));
    // }
  }
  setLogData(logData) {
    this.roomId = logData;
  }
  async info(message, object = null) {
    this.roomId = object.roomId;
    this.logger.log('info', message, {object} );
  }
}

module.exports = LoggerSpeaker;
