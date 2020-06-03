interface GameData {
  id: string
  timeout: number
}

interface Point {
  x: number
  y: number
}

interface SnakeData {
  id: string
  name: string
  health: number
  body: Point[]
  head: Point
  length: number
  shout: string
}

interface BoardData {
  height: number
  width: number
  food: Point[]
  snakes: SnakeData[]
}

interface GameState {
  game: GameData
  turn: number
  board: BoardData
  you: SnakeData
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