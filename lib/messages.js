const issues = {}

const updateFail = {
  title: '[claroline/Claroline] Automatic update failure',
  labels: ['failure'],
  body: `Hi,

The build triggered by claroline/Distribution@%s failed:

\`\`\`
%s
\`\`\`
`
}

const updatePr = {
  title: 'Update distribution version',
  body: `Hi,

This PR updates the \`claroline/distribution\` package and its dependencies. It was triggered by a push on the master branch of *claroline/Distribution*.

Commit reference: claroline/Distribution@%s
`
}

const updatePrFail = {
  title: '[claroline/Claroline] Update PR failure',
  labels: ['failure'],
  body: `Hi,

The build of the automated update pull request claroline/Claroline#%s failed with status \`%s\`.
`
}

const updateStatusFail = {
  title: '[claroline/Claroline] Status update error',
  labels: ['failure'],
  body: `Hi,

I received a status update from *claroline/Claroline* associated with commit claroline/Claroline@%s but something went wrong in the treatment of that update:

\`\`\`
%s
\`\`\`
`
}

module.exports = {
  updateFail,
  updatePr,
  updatePrFail,
  updateStatusFail
}
