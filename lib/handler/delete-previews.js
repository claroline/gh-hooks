const invariant = require('invariant')
const makeExec = require('./../executor')

const previewDir = process.env.PREVIEW_DIR

// Deletes the previews (i.e. tarballs of PR builds)
// associated with a given PR. Returns a promise.
function deletePreviews(prNumber, log) {
  invariant(prNumber, 'PR number is mandatory')
  invariant(log, 'Log function is mandatory')

  const exec = makeExec(log)

  return exec(`rm -f ${previewDir}/pr-${prNumber}*`)
}

module.exports = deletePreviews
