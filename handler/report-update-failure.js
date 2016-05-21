const invariant = require('invariant')
const client = require('./../gh-client')
const issueUri = 'https://api.github.com/repos/claroline/Distribution/issues'

function reportBuildFailure(pushRef, log) {
  invariant(pushRef, 'Push commit reference is mandatory')
  invariant(log, 'Failure log is mandatory')

  const issue = {
    title: '[claroline/Claroline] Automatic update failure',
    body: `Hi,

The build triggered by claroline/Distribution@${pushRef} failed:

\`\`\`
${log}
\`\`\`
`,
    labels: ['failure']
  }

  return new Promise((resolve, reject) => {
    client.post(issueUri, issue, response => {
      if (response.ok) {
        resolve(response.status)
      } else {
        reject(response.status)
      }
    })
  })
})

module.exports = reportBuildFailure
