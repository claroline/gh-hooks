const path = require('path')
const invariant = require('invariant')
const client = require('./../gh-client')

const repo = 'https://github.com/claroline/Claroline'
const base = 'monolithic-build'
const prUri = 'https://api.github.com/repos/claroline/Claroline/pulls'

// Opens a pull request on claroline/Claroline, targeting the master
// branch from an update branch previously created. Returns a promise.
function sendUpdatePr(pushRef) {
  invariant(pushRef, 'Push commit reference is mandatory')

  const prBranch = `dist-update-${pushRef}`
  const prBody = `Hi,

This PR updates the \`claroline/distribution\` package and its dependencies. It was triggered by a push on the master branch of *claroline/Distribution*.

Commit reference: claroline/Distribution@${pushRef}

**This is an automated update. Please check the lock file before merging.**
`

  const prData = {
    title: 'Update distribution version',
    head: prBranch,
    base: base,
    body: prBody
  }

  return client.post(prUri, prData)
}

module.exports = sendUpdatePr
