function applyMove(head: Point, move: Move): Point {
  switch (move) {
    case 'up':
      
      return {
        x: head.x,
        y: head.y + 1
      }
    
    case 'right':

      return {
        x: head.x + 1,
        y: head.y
      }
    
    case 'down':

      return {
        x: head.x,
        y: head.y - 1
      }
    
    case 'left':
      return {
        x: head.x - 1,
        y: head.y
      }
  }

  throw new Error('Attempting to apply an invalid move')
}

export default applyMove