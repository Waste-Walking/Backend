const winston = require('winston')

module.exports = {
  loggers: {},
  init() {
    let logger = winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.label({ label: "SERVER" }),
        winston.format.timestamp(),
        winston.format.printf(info => `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`)
      )
    })

    logger.add(new winston.transports.Console({
      level: "info",
      prettyPrint: true,
      colorize: true,
      silent: false,
      timestamp: true
    }))

    return logger
  }
}
