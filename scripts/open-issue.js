const fs = require('fs')
const unirest = require('unirest')
const params = require('./../parameters.json')

if (process.argv.length < 5) {
  console.log('Usage: node open-issue.js <REPO> <TITLE> <BODY>')
  process.exit(1)
}

const uri = `https://api.github.com/repos/${process.argv[2]}/issues`
const auth = {
  user: params.user,
  pass: params.pass
}
const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'User-Agent': 'node.js client'
}
const data = {
  title: process.argv[3],
  body: process.argv[4]
}

unirest
  .post(uri)
  .auth(auth)
  .headers(headers)
  .send(data)
  .end(response => {
    console.log(response.status)
    process.exit(response.ok ? 0 : 1)
  })


