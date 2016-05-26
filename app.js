require('dotenv').config({ path: __dirname + '/.env' })

const githubhook = require('githubhook')
const buildMainUpdate = require('./lib/job/build-main-update')
const deletePreviews = require('./lib/job/delete-previews')
const api = require('./lib/gh-client')
const msg = require('./lib/messages')
const util = require('./lib/utils')

const main = 'claroline/Claroline'
const dist = 'claroline/Distribution'

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
  const log = util.makeLog(`main-update-${ref}`)

  // wait for packagist ref to be updated
  util.wait(120 * 1000)
    .then(() => buildMainUpdate(ref, log))
    .then(
      () => api.openPr(main, 'master', `update-${ref}`, msg.updatePr, [ref]),
      err => api.openIssue(dist, msg.updateFail, [ref, err.message])
    )
    .then(log, err => log(`Build failure: ${err.message}`))
})

// When a PR is closed in claroline/Distribution, delete any
// related preview stored on this server
github.on('pull_request:Distribution', (ref, data) => {
  if (data.action === 'closed') {
    const prNumber = data.number
    const log = util.makeLog(`delete-previews-${prNumber}`)

    deletePreviews(prNumber, log)
      .then(
        () => log('Previews deleted'),
        err => log(`Cannot remove previews: ${err.message}`)
      )
  }
})

// When the status of an automated update PR on claroline/Claroline
// is green, merge that PR automatically; if it's red, open an issue
// in claroline/Distribution
github.on('status:Claroline', (ref, data) => {
  if (data.commit.author.login !== process.env.BOT_USER
    || data.state === 'pending') {
    return
  }

  const commit = data.commit.sha
  const log = util.makeLog(`update-pr-status-${commit}`)

  api.findPr(main, process.env.BOT_USER, commit)
    .then(
      pr => data.state === 'success' ?
        api.mergePr(main, pr, `Update distribution version (#${pr.number})`) :
        api.openIssue(dist, msg.updatePrFail, [pr.number, data.state])
    )
    .then(
      () => log('Update PR merged'),
      err => {
        log(err.message)
        api.openIssue(dist, msg.updateStatusFail, [commit, err.message])
      }
    )
})
