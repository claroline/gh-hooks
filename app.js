require('dotenv').config({ path: __dirname + '/.env' })

const githubhook = require('githubhook')
const buildMainUpdate = require('./handler/build-main-update')
const openUpdatePr = require('./handler/open-update-pr')
const reportUpdateFailure = require('./handler/report-update-failure')
const deletePreviews = require('./handler/delete-previews')
const wait = require('./wait')

const github = githubhook({
  path: '/payload',
  port: process.env.APP_PORT,
  secret: process.env.HOOKS_SECRET
})

github.listen();

// When a push happens on the master branch of claroline/Distribution,
// update composer dependencies of claroline/Claroline and open a PR
github.on('push:Distribution:refs/heads/master', data => {
  const ref = data.head_commit.id
  const jobId = `main-update-${ref}`
  const log = msg => console.log(`${jobId}: ${msg}`)

  // wait for packagist ref to be updated
  wait(120 * 1000)
    .then(() => buildMainUpdate(ref, log))
    .then(
      () => openUpdatePr(ref),
      err => reportUpdateFailure(ref, err.message)
    )
    .catch(err => log(`Build failure: ${err.message}`))
})

// When a PR is closed in claroline/Distribution, delete any
// related preview stored on this server
github.on('pull_request:Distribution', (ref, data) => {
  if (data.action === 'closed') {
    const prNumber = data.number
    const jobId = `delete-previews-${prNumber}`
    const log = msg => console.log(`${jobId}: ${msg}`)
    deletePreviews(prNumber, log)
      .catch(err => log(`Cannot remove previews: ${err.message}`))
  }
})
