require('dotenv').config()

const githubhook = require('githubhook')
const buildMainUpdate = require('./handler/build-main-update')
const openUpdatePr = require('./handler/open-update-pr')
const reportUpdateFailure = require('./handler/report-update-failure')
const logger = require('./logger')

const github = githubhook({
  path: '/payload',
  port: process.env.APP_PORT,
  secret: process.env.HOOKS_SECRET
})

github.listen();

github.on('push:Distribution:refs/heads/master', data => {
  const ref = data.head_commit.id
  const jobId = `main-update-${ref}`
  const log = (level, msg) => logger.log(level, msg, { jobId })

  buildMainUpdate(ref, log)
    .then(
      () => openUpdatePr(ref),
      err => reportUpdateFailure(ref, err.message)
    )
    .catch(err => log('error', `Build failure: ${err.message}`))
})
