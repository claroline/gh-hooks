// Simple utility function returning a promise that will be
// resolved automatically after a certain amount of time.
function wait(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  })
}

module.exports = wait
