require('dotenv').config({ path: __dirname + '/.env' })

const githubhook = require('githubhook')
const buildMainUpdate = require('./handler/build-main-update')
const openUpdatePr = require('./handler/open-update-pr')
const reportUpdateFailure = require('./handler/report-update-failure')
const deletePreviews = require('./handler/delete-previews')
const logger = require('./logger')
const wait = require('./wait')

const github = githubhook({
  path: '/payload',
  port: process.env.APP_PORT,
  secret: process.env.HOOKS_SECRET
})

github.listen();

// When a push happens on the master branch of claroline/Distribution,
// update composer depedencies of claroline/Claroline and open a PR
github.on('push:Distribution:refs/heads/master', data => {
  const ref = data.head_commit.id
  const jobId = `main-update-${ref}`
  const log = (level, msg) => logger.log(level, msg, { jobId })

  // wait for packagist ref to be updated
  wait(120 * 1000)
    .then(() => buildMainUpdate(ref, log))
    .then(
      () => openUpdatePr(ref),
      err => reportUpdateFailure(ref, err.message)
    )
    .catch(err => log('error', `Build failure: ${err.message}`))
})

// When a PR is closed in claroline/Distribution, delete any
// related preview stored on this server
github.on('pull_request:Distribution', (ref, data) => {
  if (data.action === 'closed') {
    const prNumber = data.number
    const jobId = `delete-previews-${prNumber}`
    const log = (level, msg) => logger.log(level, msg, { jobId })
    deletePreviews(prNumber, log)
      .catch(err => log('error', `Cannot remove previews: ${err.message}`))
  }
})
