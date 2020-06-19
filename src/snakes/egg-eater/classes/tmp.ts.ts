class Snake {
    constructor(public body: number[]) {}
}

const enemies = [
    new Snake([0, 1, 2, 3]),
    new Snake([0, 1, 2, 3, 4, 5]),
    new Snake([0, 1]),
    new Snake([0, 1, 2, 3])
]

const player = new Snake([0, 1, 2, 3, 4, 5, 6, 7])

const biggestEnemy = (enemies || []).sort(
    (a, b) => b.body.length - a.body.length
)[0]

let isDominant = true

if (biggestEnemy) {
    isDominant = player.body.length - biggestEnemy.body.length >= 2
}

console.log(isDominant)
