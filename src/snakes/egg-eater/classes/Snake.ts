import { moves } from '@/utils/constants'
import applyMoveToPoint from '@/utils/apply-move-to-point'
import isSamePoint from '@/utils/is-same-point'
import { SnakeData, Point } from '@/types'
import isPointOnBoard from '@/utils/is-point-on-board'

class Snake implements SnakeData {
    readonly id: string
    readonly name: string
    public health: number
    readonly body: Point[]
    readonly head: Point
    readonly length: number
    readonly shout: string

    public possibleNextHeadPositions: Point[] = []

    constructor(
        readonly data: SnakeData,
        readonly width: number,
        readonly height: number,
        private ate: boolean = false
    ) {
        Object.assign(this, data)

        this.possibleNextHeadPositions = moves
            .map(move => applyMoveToPoint(this.head, move))
            .filter(updatedHead => {
                return isPointOnBoard(updatedHead, this.height, this.width)
            })
            .filter(updatedHead => {
                const nextBody = [...this.body]

                if (!this.ate) {
                    nextBody.pop()
                }

                return !nextBody.some(segment =>
                    isSamePoint(segment, updatedHead)
                )
            })
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

    /**
     * Returns a new snake moved to the new point.  Does not modify this snake.
     */
    move(point: Point, didEat = false, willEat = false): Snake {
        const newData: SnakeData = {
            id: this.id,
            name: this.name,
            health: this.health,
            body: [{ ...point }, ...this.body],
            head: { ...point },
            length: this.length,
            shout: this.shout
        }

        if (!didEat) {
            newData.body.pop()
        }

        return new Snake(newData, this.width, this.height, willEat)
    }
}

export default Snake
