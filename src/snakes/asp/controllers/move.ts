import { Request, Response } from "express"

function move(request: Request<{}, MoveResponse, GameState>, response: Response<MoveResponse>) {
  const gameState = request.body

  var possibleMoves: Move[] = ['up', 'down', 'left', 'right']

  const move = possibleMoves.find((move: Move) => isMoveSafe(gameState, move))

  console.log('MOVE: ' + move)
  response.status(200).send({
    move: move
  })
}

function isMoveSafe(gameState: GameState, move: Move) {
  const head = gameState.you.head
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
  if (nextHead.x > gameState.board.width) return false
  if (nextHead.x < 1) return false
  if (nextHead.y > gameState.board.height) return false
  if (nextHead.y < 1) return false

  return true
}

export default move
