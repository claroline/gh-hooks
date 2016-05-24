const invariant = require('invariant')
const makeExec = require('./../executor')

const previewDir = process.env.PREVIEW_DIR

function deletePreviews(prNumber, log) {
  invariant(prNumber, 'PR number is mandatory')
  invariant(log, 'Log function is mandatory')

  const exec = makeExec(log)

  return exec(`rm -f ${previewDir}/pr-${prNumber}*`)
}

module.exports = deletePreviews
