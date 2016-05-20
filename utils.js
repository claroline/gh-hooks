const fs = require('fs')
const spawn = require('child_process').spawnSync;
const unirest = require('unirest')
const params = require('./parameters.json')

const auth = {
  user: params.user,
  pass: params.pass
}

const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'User-Agent': 'node.js client'
}

function getParameters() {
  return params
}

function post(uri, data, onResponse) {
  unirest
    .post(uri)
    .auth(auth)
    .headers(headers)
    .send(data)
    .end(onResponse)
}

function makeExecutor(onFail) {
  return (cmd, args, alias) => {
    const cmdString = alias ? `"${alias}"` : `"${cmd} ${args.join(' ')}"`
    console.log(`Executing ${cmdString}...`)
    const res = spawn(cmd, args)

    if (res.status !== 0) {
      console.error(`Failed to execute ${cmdString}`)
      console.error('Output: ' + (res.stderr || res.stdout || res.error.message))
      onFail(cmdString)

      return false
    }

    return true
  }
}

function batchCommands(executor, commands) {
  for (var i = 0, max = commands.length; i < max; ++i) {
    if (typeof commands[i] === 'function') {
      if (!commands[i]()) {
        break
      }
    } else if (!executor(...commands[i])) {
      break
    }
  }
}

module.exports = {
  getParameters,
  post,
  makeExecutor,
  batchCommands
}
