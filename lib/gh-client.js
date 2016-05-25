const util = require('util')
const invariant = require('invariant')
const unirest = require('unirest')

const auth = {
  user: process.env.BOT_USER,
  pass: process.env.BOT_PASS
}

const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'User-Agent': 'node.js client'
}

// Opens an issue in a given repository. The issue argument shoud be
// an object with title and body attributes. Also accepts an array of
// parameters that will be bound to the issue body using util.format().
// Returns a promise.
function openIssue(repoSlug, issue, bodyParams) {
  bodyParams = bodyParams || []

  invariant(repoSlug, 'Target repository is mandatory')
  invariant(issue, 'Issue object is mandatory')
  invariant(Array.isArray(bodyParams), 'Issue params must be an array')

  const uri = `https://api.github.com/repos/${repoSlug}/issues`
  const args = bodyParams

  args.unshift(issue.body)
  issue.body = util.format.apply(util.format, args)

  return send('POST', uri, issue)
}

// Opens a pull request in a given repository. The PR branch must be
// in the same repository. See openIssue() for the issue parameter.
// Returns a promise.
function openPr(repoSlug, base, branch, issue, bodyParams) {
  bodyParams = bodyParams || []

  invariant(repoSlug, 'Target repository is mandatory')
  invariant(base, 'Base branch is mandatory')
  invariant(branch, 'PR branch is mandatory')
  invariant(issue, 'Issue object is mandatory')
  invariant(Array.isArray(bodyParams), 'Issue params must be an array')

  const uri = `https://api.github.com/repos/${repoSlug}/pulls`
  const args = bodyParams

  args.unshift(issue.body)
  issue.body = util.format.apply(util.format, args)

  return send('POST', uri, issue)
}

// Finds a pull request in a given repository by its author and its head
// commit SHA. Returns a promise fullfilling with the PR object, or throwing
// an error if no corresponding PR could be found.
function findPr(repoSlug, author, headCommit) {
  invariant(repoSlug, 'Target repository is mandatory')
  invariant(author, 'Author login is mandatory')
  invariant(headCommit, 'Head commit SHA is mandatory')

  const uri = `https://api.github.com/repos/${repoSlug}/pulls`

  return get(uri)
    .then(prs => prs.find(pr =>
      pr.user.login === author && pr.head.sha === headCommit
    ))
    .then(pr => {
      if (pr) {
        return pr
      }

      throw new Error(`Cannot find PR of user ${author} with SHA ${headCommit}`)
    })
}

// Merges a pull request in a given repository and deletes the PR branch.
// PR argument is an object as returned by the github API. Returns a promise.
function mergePr(repoSlug, prObject) {
  invariant(repoSlug, 'Target repository is mandatory')
  invariant(prObject, 'PR object is mandatory')

  const number = prObject.number
  const branch = prObject.head.ref
  const uri = `https://api.github.com/repos/${repoSlug}/pulls/${number}/merge`

  return send('PUT', uri, { squash: true })
    .then(() => deleteBranch(repoSlug, branch))
}

// Deletes a branch of a given repository. Returns a promise.
function deleteBranch(repoSlug, branch) {
  invariant(repoSlug, 'Target repository is mandatory')
  invariant(branch, 'Target branch is mandatory')

  const uri = `https://api.github.com/repos/${repoSlug}/refs/heads/${branch}`

  return new Promise((resolve, reject) => {
    unirest
      .delete(uri)
      .auth(auth)
      .headers(headers)
      .end(response => {
        if (!response.status && response.error) {
          return reject(response.error)
        }

        const msg = `DELETE ${uri} ${response.status}`

        response.ok ? resolve(msg) : reject(new Error(msg))
      })
  })
}

function send(method, uri, data) {
  invariant(
    method === 'POST' || method === 'PUT',
    'Method must be POST or PUT'
  )
  invariant(uri, 'URI is mandatory')
  invariant(data, 'Data is mandatory')

  return new Promise((resolve, reject) => {
    unirest(method, uri)
      .auth(auth)
      .headers(headers)
      .send(data)
      .end(response => {
        if (!response.status && response.error) {
          return reject(response.error)
        }

        var msg = `${method} ${uri} ${response.status}`

        if (response.body.message) {
          msg += `: ${response.body.message}`
        }

        response.ok ? resolve(msg) : reject(new Error(msg))
      })
  })
}

function get(uri) {
  invariant(uri, 'URI is mandatory')

  return new Promise((resolve, reject) => {
    unirest
      .get(uri)
      .auth(auth)
      .headers(headers)
      .end(response => {
        if (!response.status && response.error) {
          return reject(response.error)
        }

        if (!response.ok) {
          return reject(`${method} ${uri} ${response.status}`)
        }

        return resolve(response.body)
      })
  })

}

module.exports = {
  openIssue,
  openPr,
  findPr,
  mergePr
}
