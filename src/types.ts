export interface GameData {
    id: string
    timeout: number
}

export interface Point {
    x: number
    y: number
}

export interface SnakeData {
    id: string
    name: string
    health: number
    body: Point[]
    head: Point
    length: number
    shout: string
}

export interface BoardData {
    height: number
    width: number
    food: Point[]
    snakes: SnakeData[]
}

export interface GameState {
    game: GameData
    turn: number
    board: BoardData
    you: SnakeData
}

// Info
export interface InfoResponse {
    apiversion: string
    author: string
    color: string
    head: string
    tail: string
}

// Move
export type Move = 'up' | 'left' | 'right' | 'down'

export interface MoveResponse {
    move: Move
    shout?: string
}
