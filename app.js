const githubhook = require('githubhook')
const params = require('./parameters')
const buildMainUpdate = require('./handler/build-main-update')
const openUpdatePr = require('./handler/open-update-pr')
const reportUpdateFailure = require('./handler/report-update-failure')

const github = githubhook({
  port: params.port,
  path: '/payload',
  secret: params.secret
})

github.listen();

github.on('push:Distribution:refs/heads/master', data => {
  const ref = data.head_commit.id

  buildMainUpdate(ref)
    .then(() => openUpdatePr(ref))
    .catch(error => reportUpdateFailure(ref, error.message))
  }
})
