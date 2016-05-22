require('dotenv').config()

const githubhook = require('githubhook')
const buildMainUpdate = require('./handler/build-main-update')
const openUpdatePr = require('./handler/open-update-pr')
const reportUpdateFailure = require('./handler/report-update-failure')

const github = githubhook({
  path: '/payload',
  port: process.env.APP_PORT,
  secret: process.env.HOOKS_SECRET
})

github.listen();

github.on('push:Distribution:refs/heads/master', data => {
  const ref = data.head_commit.id

  buildMainUpdate(ref)
    .then(
      () => openUpdatePr(ref),
      err => reportUpdateFailure(ref, err.message)
    )
    .catch(err => console.error(err))
  }
})
