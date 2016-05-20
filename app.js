const githubhook = require('githubhook')
const params = require('./parameters.json')

const github = githubhook({
  port: params.port,
  secret: params.secret
})

github.listen();

github.on('*', function (event, repo, ref, data) {

  console.log('Received smth')

});

github.on('event', function (repo, ref, data) {
});

github.on('event:reponame', function (ref, data) {
});

github.on('event:reponame:ref', function (data) {
});

github.on('reponame', function (event, ref, data) {
});

github.on('reponame:ref', function (event, data) {
});

