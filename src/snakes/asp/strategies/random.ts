import Game from "@/utils/Game";
import shuffle from "fast-shuffle";
import { moves } from "@/utils/constants";
import logger from "@/logger/logger";

function random(game: Game) {
  logger.log(game, `[Random] Starting the random strategy`)

  const shuffledMoves = shuffle(moves);

  logger.log(game, `[Random] Trying moves in this order: ${shuffledMoves}`)

  const move = shuffledMoves.find((m: Move) => {
    // Make sure we're not running into anything known
    return game.isMoveSafe(m)
  })

  logger.log(game, `[Random] Resolved to ${move || 'nothing!'}`)

  // Uh oh, we are probably dead
  if (!move) {
    logger.log(game, `[Random] Defaulting to  ${shuffledMoves[0]}`)
    return shuffledMoves[0]
  }

  return move;
}

export default random