import Game from "../../../utils/Game";
import shuffle from "fast-shuffle";
import { moves } from "../../../utils/constants";

function random(game: Game) {
  const shuffledMoves = shuffle(moves);


  const move = shuffledMoves.find((move: Move) => {
    // Make sure we're not running into anything known
    return game.isMoveSafe(move)
  })


  // Uh oh, we gunna die
  if (!move) {
    return shuffledMoves[0]
  }

  return move;
}

export default random