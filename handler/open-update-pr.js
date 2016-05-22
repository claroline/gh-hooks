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

  return new Promise((resolve, reject) => {
    client.post(prUri, prData, response => {
      if (response.ok) {
        resolve(response.status)
      } else {
        reject(new Error(
          `Failed to open PR for main repo update (${response.status})`
        ))
      }
    })
  })
}

module.exports = sendUpdatePr
