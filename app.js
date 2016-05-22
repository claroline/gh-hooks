require('dotenv').config()

const githubhook = require('githubhook')
const buildMainUpdate = require('./handler/build-main-update')
const openUpdatePr = require('./handler/open-update-pr')
const reportUpdateFailure = require('./handler/report-update-failure')

const github = githubhook({
  port: process.env.APP_PORT,
  path: '/payload',
  secret: process.env.HOOKS_SECRET
})

github.listen();

github.on('push:Distribution:refs/heads/master', data => {
  const ref = data.head_commit.id

  buildMainUpdate(ref)
    .then(() => openUpdatePr(ref))
    .catch(error => reportUpdateFailure(ref, error.message))
  }
})
