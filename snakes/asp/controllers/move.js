function move(request, response) {
  var gameData = request.body

  var possibleMoves = ['up', 'down', 'left', 'right']

  const move = possibleMoves.find(move => isMoveSafe(gameData, move))

  console.log('MOVE: ' + move)
  response.status(200).send({
    move: move
  })
}

function isMoveSafe(gameData, move) {
  const head = gameData.you.head
  let nextHead = { x: head.x, y: head.y }

  switch (move) {
    case 'up':
      nextHead.y = nextHead.y - 1
      break

    case 'down':
      nextHead.y = nextHead.y + 1
      break

    case 'left':
      nextHead.x = nextHead.x - 1
      break

    case 'right':
      nextHead.x = nextHead.x + 1
      break
  }

  // Check to make sure the move stays on the board
  if (nextHead.x > gameData.board.width) return false
  if (nextHead.x < 1) return false
  if (nextHead.y > gameData.board.height) return false
  if (nextHead.y < 1) return false

  return true
}

module.exports = move
