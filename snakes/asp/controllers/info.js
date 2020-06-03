function info(request, response) {
  var battlesnakeInfo = {
    apiversion: '1',
    author: 'Josh Stabback',
    color: '#BADA55',
    head: 'default',
    tail: 'default'
  }
  response.status(200).json(battlesnakeInfo)
}

module.exports = info
