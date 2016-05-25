const exec = require('child_process').exec;
const invariant = require('invariant')

// Factory function for making async process executors using promises.
// Each executor will be bound to a given log function.
function makeExec(log) {
  invariant(log, 'Log function is mandatory')

  return cmd => {
    return new Promise((resolve, reject) => {
      log(cmd)
      const child = exec(cmd)
      child.stdout.on('data', log)
      child.stderr.on('data', log)
      child.on('close', code => {
        code === 0 ?
          resolve(0) :
          reject(new Error(`Command "${cmd}" failed with code ${code}`))
      })
    })
  }
}

// Wraps the console.log function so that every
// message is prefixed with an identifier
function makeLog(id) {
  return msg => console.log(`${id}: ${msg}`)
}

// Returns a promise that will be resolved automatically
// after a certain amount of time.
function wait(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  })
}

module.exports = { wait, makeLog, makeExec }
