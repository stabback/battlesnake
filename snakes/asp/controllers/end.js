function end(request, response) {
  var gameData = request.body

  console.log('END')
  response.status(200).send('ok')
}

module.exports = end