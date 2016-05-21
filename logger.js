const util = require('util')
const invariant = require('invariant')
const winston = require('winston')
const RotateTransport = require('winston-daily-rotate-file')

// Custom memory transport, storing logs by session id
// in an internal property. Accumulated session logs are
// accessed and deleted using the flush() method.
function MemoryTransport(options) {
  options = options || {}
  this.name = 'memoryTransport'
  this.level = options.level || 'info'
  this.logs = {}
}

util.inherits(MemoryTransport, winston.Transport)

MemoryTransport.prototype.log = function (level, msg, meta, callback) {
  invariant(meta && meta.sessionId, 'Session identifier is mandatory')

  this.logs[meta.sessionId] = this.logs[meta.sessionId] || '';
  this.logs[meta.sessionId] += msg + '\n';
  callback(null, true)
}

MemoryTransport.prototype.flush = function (sessionId) {
  if (!this.logs[sessionId]) {
    return ''
  }

  logs = this.logs[sessionId]
  delete this.logs[sessionId]

  return logs
}

// Building a winston logger with rotate file and memory session transports.
const memory = new MemoryTransport()
const rotate = new RotateTransport({
  filename: __dirname + '/logs/rotate.log'
})
const logger = new (winston.Logger)({
  transports: [memory, rotate]
})

// Utility function returning a shortcut log() function bound to a
// given session id. The returned function also has flush()/close()
// methods to access and delete accumulated session logs.
function makeSessionLogger(sessionId) {
  invariant(sessionId, 'Session identifier is mandatory')

  const log = (level, msg) => {
    logger.log(level, msg, { sessionId })
  }

  log.flush = log.close = (closeSession) => {
    return memory.flush(sessionId)
  }

  return log
}

module.exports = makeSessionLogger
