const path = require('path')
const invariant = require('invariant')
const client = require('./../gh-client')

const repo = 'https://github.com/claroline/Claroline'
const base = 'monolithic-build'
const prUri = 'https://api.github.com/repos/claroline/Claroline/pulls'

function sendUpdatePr(pushRef) {
  invariant(pushRef, 'Push commit reference is mandatory')

  const prBranch = `dist-update-${pushRef}`
  const prBody = `Hi,

This PR updates the \`claroline/distribution\` package and its dependencies.
It was triggered by a push on the master branch of *claroline/Distribution*
(ref: claroline/Distribution@${pushRef}).

***PLEASE CHECK THE LOCK FILE BEFORE MERGING***

If you can't see any changes related to the distribution package, there are
good chances that the packagist hook didn't work.
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
