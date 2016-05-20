const path = require('path')
const utils = require('./../utils')

if (process.argv.length !== 3) {
  console.log('Usage: node open-update-pr.js <REF>')
  process.exit(1)
}

const pushRef = process.argv[2]
const params = utils.getParameters()
const mainRepo = 'https://github.com/claroline/Claroline'
const distRepo = 'https://github.com/claroline/Distribution'
const baseBranch = 'monolithic-build'
const prBranch = `dist-update-${pushRef}`
const cloneDir = path.resolve(__dirname, '..', prBranch)
const authority = `${params.user}:${params.pass}`
const pushUri = `https://${authority}@github.com/claroline/Claroline`
const prUri = 'https://api.github.com/repos/claroline/Claroline/pulls'
const failUri = 'https://api.github.com/repos/claroline/Distribution/issues'

const prBody = `Hi,

This PR updates the \`claroline/distribution\` package and its dependencies. It was triggered by a push on the master branch of *claroline/Distribution* (ref: claroline/Distribution@${pushRef}).

***PLEASE CHECK THE LOCK FILE BEFORE MERGING***

If you can't see any changes related to the distribution package, there are good chances that the packagist hook didn't work.
`

const prData = {
  title: 'Update distribution version',
  head: prBranch,
  base: baseBranch,
  body: prBody
}

// if any step fails, open an issue in the distribution repo
const exec = utils.makeExecutor(cmd => {
  const data = {
    title: '[claroline/Claroline] Automatic update failure',
    body: 'Hi,\n\n The build triggered by claroline/Distribution@' + pushRef + ' failed when executing the command: `' + cmd + '`.',
    labels: ['failure']
  }
  utils.post(failUri, data, response => {
    console.log(response.status))
    process.exit(1)
  }
})

utils.batchCommands(exec, [
  ['rm', ['-rf', cloneDir], 'rm clone dir'],
  ['git', ['clone', '-b', baseBranch, mainRepo, cloneDir], 'git clone main repo'],
  () => { process.chdir(cloneDir); return true },
  ['git', ['checkout', '-b', prBranch]],
  ['composer', ['update', 'claroline/distribution', '--no-scripts']],
  ['git', ['add', 'composer.lock']],
  ['git', ['config', 'user.name', params.user], 'git set user'],
  ['git', ['config', 'user.email', params.email], 'git set email'],
  ['git', ['commit', '-m', 'Update distribution version']],
  ['git', ['remote', 'set-url', 'origin', pushUri], 'git set-url'],
  ['git', ['push', '--set-upstream', 'origin', prBranch], 'git push'],
  ['rm', ['-rf', cloneDir], 'rm clone dir'],
  () => {
    // open a PR on the main repo
    utils.post(prUri, prData, response => {
      console.log(response.status)
      process.exit(response.ok ? 0 : 1)
    })
  }
])

