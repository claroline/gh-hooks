const invariant = require('invariant')
const client = require('./../gh-client')
const issueUri = 'https://api.github.com/repos/claroline/Distribution/issues'

function reportBuildFailure(pushRef, buildLog) {
  invariant(pushRef, 'Push commit reference is mandatory')
  invariant(buildLog, 'Build log is mandatory')

  const issue = {
    title: '[claroline/Claroline] Automatic update failure',
    body: `Hi,

The build triggered by claroline/Distribution@${pushRef} failed:

\`\`\`
${buildLog}
\`\`\`
`,
    labels: ['failure']
  }

  return new Promise((resolve, reject) => {
    client.post(issueUri, issue, response => {
      if (response.ok) {
        resolve(response.status)
      } else {
        reject(new Error(
          `Failed to open issue for build failure (${response.status})`
        ))
      }
    })
  })
}

module.exports = reportBuildFailure
