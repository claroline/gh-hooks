const fs = require('fs')
const path = require('path')
const invariant = require('invariant')
const makeExec = require('./../utils').makeExec

const repo = 'https://github.com/claroline/Claroline'
const base = 'master'

// Clones the main repo, updates claroline/distribution and its
// dependencies and commits/pushes the result on a dedicated branch
// of claroline/Claroline. Returns a promise.
function buildMainUpdate(pushRef, logger) {
  invariant(pushRef, 'Push commit reference is mandatory')
  invariant(pushRef, 'Logger function is mandatory')

  var output = ''

  const prBranch = `dist-update-${pushRef}`
  const originalDir = process.cwd()
  const cloneDir = path.resolve(__dirname, '..', prBranch)
  const log = msg => {
    output += msg + '\n'
    logger(msg)
  }
  const exec = makeExec(log)

  return exec(`rm -rf ${cloneDir}`)
    .then(() => exec(`git clone -b ${base} ${repo} ${cloneDir}`))
    .then(() => process.chdir(cloneDir))
    .then(() => exec(`git checkout -b ${prBranch}`))
    .then(() => exec(`composer update claroline/distribution --no-scripts`))
    .then(() => checkDistVersion(path.resolve(cloneDir, 'composer.lock'), pushRef))
    .then(() => exec(`git add composer.lock`))
    .then(() => exec(`git config user.name $BOT_USER`))
    .then(() => exec(`git config user.email $BOT_EMAIL`))
    .then(() => exec(`git commit -m 'Update distribution version'`))
    .then(() => exec(`git remote set-url origin ${repo}`))
    .then(() => exec(`git push --set-upstream --force origin ${prBranch}`))
    .then(() => exec(`rm -rf ${cloneDir}`))
    .then(() => {
      process.chdir(originalDir)
      log('Build succeeded')
    })
    .catch(error => {
      process.chdir(originalDir)
      log(error.message)
      throw new Error(output)
    })
}

function checkDistVersion(lockFile, expectedRef) {
  return new Promise((resolve, reject) => {
    fs.readFile(lockFile, 'utf8', (err, data) => {
      if (err) {
        return reject(err)
      }

      var lock;

      try {
        lock = JSON.parse(data)
      } catch (err) {
        return reject(new Error('Cannot parse composer.lock'))
      }

      const dist = lock.packages
        .find(package => package.name === 'claroline/distribution')

      if (!dist) {
        return reject(new Error(
          'Cannot find claroline/distribution in composer.lock'
        ))
      }

      if (dist.source.reference !== expectedRef) {
        return reject(new Error(`
Expected reference ${expectedRef} for claroline/distribution in updated
composer.lock, found ${dist.source.reference}. Make sure the packagist
hook worked properly.`))
      }

      resolve('Versions match')
    })
  })
}

module.exports = buildMainUpdate
