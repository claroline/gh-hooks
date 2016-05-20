const path = require('path')
const utils = require('./../utils')

if (process.argv.length !== 3) {
  console.log('Usage: node open-update-pr.js <REF>')
  process.exit(1)
}

const exec = utils.exec
const pushRef = process.argv[2]
const params = utils.getParameters()
const repo = 'https://github.com/claroline/Claroline'
const base = 'monolithic-build'
const prBranch = `dist-update-${pushRef}`
const cloneDir = path.resolve(__dirname, '..', prBranch)
const authority = `${params.user}:${params.pass}`
const pushUri = `https://${authority}@github.com/claroline/Claroline`
const prUri = 'https://api.github.com/repos/claroline/Claroline/pulls'

const prBody = `Hi,

This PR updates the \`claroline/distribution\` package and its dependencies. It was triggered by a push on the master branch of *claroline/Distribution* (ref: claroline/Distribution@${pushRef}).

***PLEASE CHECK THE LOCK FILE BEFORE MERGING***

If you can't see any changes related to the distribution package, there are good chances that the packagist hook didn't work.
`

const prData = {
  title: 'Update distribution version',
  head: prBranch,
  base: base,
  body: prBody
}

exec('rm', ['-rf', cloneDir], 'rm clone dir')
exec('git', ['clone', '-b', base, repo, cloneDir], 'git clone main repo')

process.chdir(cloneDir)

exec('git', ['checkout', '-b', prBranch])
exec('composer', ['update', 'claroline/distribution', '--no-scripts'])
exec('git', ['add', 'composer.lock'])
exec('git', ['config', 'user.name', params.user], 'git set user')
exec('git', ['config', 'user.email', params.email], 'git set email')
exec('git', ['commit', '-m', 'Update distribution version'])
exec('git', ['remote', 'set-url', 'origin', pushUri], 'git set-url')
exec('git', ['push', '--set-upstream', 'origin', prBranch], 'git push')
exec('rm', ['-rf', cloneDir], 'rm clone dir')

// open a PR on the main repo
utils.post(prUri, prData, response => {
  console.log(response.status)
  process.exit(response.ok ? 0 : 1)
})

