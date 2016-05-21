const path = require('path')
const invariant = require('invariant')
const makeLog = require('./../logger')
const makeExec = require('./../executor')
const params = require('./../parameters')

const repo = 'https://github.com/claroline/Claroline'
const base = 'monolithic-build'
const authority = `${params.user}:${params.pass}`
const pushUri = `https://${authority}@github.com/claroline/Claroline`

function buildMainUpdate(pushRef) {
  invariant(pushRef, 'Push commit reference is mandatory')

  const prBranch = `dist-update-${pushRef}`
  const cloneDir = path.resolve(__dirname, '..', prBranch)

  const log = makeLog(`main-update-${pushRef}`)
  const exec = makeExec(log)

  return exec(`rm -rf ${cloneDir}`)
    .then(() => exec(`git clone -b ${base} ${repo} ${cloneDir}`))
    .then(() => process.chdir(cloneDir))
    .then(() => exec(`git checkout ${pushRef}`))
    .then(() => exec(`git checkout -b ${prBranch}`))
    .then(() => exec(`composer update claroline/distribution --no-scripts`))
    .then(() => exec(`git add composer.lock`))
    .then(() => exec(`git config user.name ${params.user}`))
    .then(() => exec(`git config user.email ${params.email}`))
    .then(() => exec(`git commit -m 'Update distribution version'`))
    .then(() => exec(`git remote set-url origin ${pushUri}`))
    .then(() => exec(`git push --set-upstream origin ${prBranch}`))
    .then(() => exec(`rm -rf ${cloneDir}`))
    .then(() => {
      log('info', 'Success')
      log.close()
    })
    .catch(error => {
      log('error', error.message)
      throw new Error(log.flush())
    })
}

module.exports = buildMainUpdate
