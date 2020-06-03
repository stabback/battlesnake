interface Game {
  id: string
  timeout: number
}

interface Point {
  x: number
  y: number
}

interface Snake {
  id: string
  name: string
  health: number
  body: Point[]
  head: Point
  length: number
  shout: string
}

interface Board {
  height: number
  width: number
  food: Point[]
  snakes: Snake[]
}

interface GameState {
  game: Game
  turn: number
  board: Board
  you: Snake
}

// Info
interface InfoResponse {
  apiversion: string
  author: string
  color: string
  head: string
  tail: string
}


// Move
type Move = 'up' | 'left' | 'right' | 'down'

interface MoveResponse {
  move: Move
  shout?: string
}