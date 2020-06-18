import { Move, Point } from '@/types'

function applyMoveToPoint(point: Point, move: Move): Point {
    switch (move) {
        case 'up':
            return {
                x: point.x,
                y: point.y + 1
            }

        case 'right':
            return {
                x: point.x + 1,
                y: point.y
            }

        case 'down':
            return {
                x: point.x,
                y: point.y - 1
            }

        case 'left':
            return {
                x: point.x - 1,
                y: point.y
            }
    }

    throw new Error('Attempting to apply an invalid move')
}

export default applyMoveToPoint
