import { moves } from '@/utils/constants'
import applyMoveToPoint from '@/utils/apply-move-to-point'
import isSamePoint from '@/utils/is-same-point'
import { SnakeData, Point } from '@/types'

class Snake implements SnakeData {
    readonly id: string
    readonly name: string
    public health: number
    readonly body: Point[]
    readonly head: Point
    readonly length: number
    readonly shout: string

    constructor(
        readonly data: SnakeData,
        readonly width: number,
        readonly height: number
    ) {
        Object.assign(this, data)
    }

    intersects(
        point: Point,
        includeTail = true,
        includePossibleMoves = true
    ): boolean {
        const segments = []

        segments.push(...this.body.slice(0, this.body.length - 1))

        if (includeTail) {
            segments.push(this.body[this.body.length - 1])
        }

        if (includePossibleMoves) {
            segments.push(...this.possibleNextHeadPositions)
        }

        return segments.some(segment => isSamePoint(segment, point))
    }

    get possibleNextHeadPositions(): Point[] {
        return moves
            .map(move => applyMoveToPoint(this.head, move))
            .filter(updatedHead => {
                return (
                    updatedHead.x >= 0 &&
                    updatedHead.y >= 0 &&
                    updatedHead.x < this.width &&
                    updatedHead.y < this.height
                )
            })
            .filter(updatedHead => {
                return !this.body.some(segment =>
                    isSamePoint(segment, updatedHead)
                )
            })
    }

    /**
     * Returns a new snake moved to the new point.  Does not modify this snake.
     */
    move(point: Point, preserveTail = false): Snake {
        const newData: SnakeData = {
            id: this.id,
            name: this.name,
            health: this.health,
            body: [{ ...point }, ...this.body],
            head: { ...point },
            length: this.length,
            shout: this.shout
        }

        if (!preserveTail) {
            newData.body.pop()
        }

        return new Snake(newData, this.width, this.height)
    }
}

export default Snake
