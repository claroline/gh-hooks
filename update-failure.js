const data = {
  title: '[claroline/Claroline] Automatic update failure',
  body: 'Hi,\n\n The build triggered by claroline/Distribution@' + pushRef + ' failed when executing the command: `' + cmd + '`.',
  labels: ['failure']
}

utils.post(failUri, data, response => {
  console.log(response.status))
  process.exit(1)
})

