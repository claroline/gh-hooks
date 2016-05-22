const winston = require('winston')
const RotateTransport = require('winston-daily-rotate-file')

const rotate = new RotateTransport({
  filename: __dirname + '/logs/rotate.log'
})
const logger = new (winston.Logger)({
  transports: [rotate]
})

module.exports = logger
