const exec = require('child_process').exec;
const invariant = require('invariant')

// Factory function for making async process executors using promises.
// Each executor will be bound to a given logger (which must use the
// winston log() function signature)
function makeExec(log) {
  invariant(log, 'Log function is mandatory')

  return cmd => {
    return new Promise((resolve, reject) => {
      log('info', cmd)
      const child = exec(cmd)
      child.stdout.on('data', data => log('info', data))
      child.stderr.on('data', data => log('error', data))
      child.on('close', code => {
        code === 0 ?
          resolve(0) :
          reject(new Error(`Command "${cmd}" failed with code ${code}`))
      })
    })
  }
}

module.exports = makeExec
