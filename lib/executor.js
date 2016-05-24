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

module.exports = makeExec
