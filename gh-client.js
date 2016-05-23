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

function post(uri, data, onResponse) {
  invariant(uri, 'URI is mandatory')
  invariant(data, 'POST data is mandatory')
  invariant(onResponse, 'Response callback is mandatory')

  unirest
    .post(uri)
    .auth(auth)
    .headers(headers)
    .send(data)
    .end(onResponse)
}

module.exports = { post }
