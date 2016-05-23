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

function post(uri, data) {
  invariant(uri, 'URI is mandatory')
  invariant(data, 'POST data is mandatory')

  return new Promise((resolve, reject) => {
    unirest
      .post(uri)
      .auth(auth)
      .headers(headers)
      .send(data)
      .end(response => {
        const msg = `POST ${uri} ${response.status}`
        response.ok ? resolve(msg) : reject(new Error(msg))
      })
  })
}

module.exports = { post }
