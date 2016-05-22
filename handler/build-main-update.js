const path = require('path')
const invariant = require('invariant')
const makeExec = require('./../executor')

const repo = 'https://github.com/claroline/Claroline'
const base = 'monolithic-build'
const pushUri = `https://$BOT_USER:$BOT_PASS@github.com/claroline/Claroline`

function buildMainUpdate(pushRef, logger) {
  invariant(pushRef, 'Push commit reference is mandatory')
  invariant(pushRef, 'Logger function is mandatory')

  let output = ''

  const prBranch = `dist-update-${pushRef}`
  const cloneDir = path.resolve(__dirname, '..', prBranch)
  const log = (level, msg) => {
    output += msg
    logger(level, msg)
  }
  const exec = makeExec(log)

  return exec(`rm -rf ${cloneDir}`)
    .then(() => exec(`git clone -b ${base} ${repo} ${cloneDir}`))
    .then(() => process.chdir(cloneDir))
    .then(() => exec(`git checkout ${pushRef}`))
    .then(() => exec(`git checkout -b ${prBranch}`))
    .then(() => exec(`composer update claroline/distribution --no-scripts`))
    .then(() => exec(`git add composer.lock`))
    .then(() => exec(`git config user.name $BOT_USER`))
    .then(() => exec(`git config user.email $BOT_EMAIL`))
    .then(() => exec(`git commit -m 'Update distribution version'`))
    .then(() => exec(`git remote set-url origin ${pushUri}`))
    .then(() => exec(`git push --set-upstream origin ${prBranch}`))
    .then(() => exec(`rm -rf ${cloneDir}`))
    .then(() => log('info', 'Build succeeded'))
    .catch(error => {
      log('error', error.message)
      throw new Error(output)
    })
}

module.exports = buildMainUpdate
