import { PIECE } from "./board.js";
import DropPhaseGame from "./drop_phase.js";
import MovePhaseGame, { STEP } from "./move_phase.js";

const PHASE = {
  DROP: "Drop",
  MOVE: "Move",
};

// choose randomly between two values
const twoRandom = (a, b) => {
  return Math.random() < 0.5 ? a : b;
};

export default class OngoingGame {
  constructor(player1, player2, width, height) {
    this.phase = PHASE.DROP;

    this.black_player = twoRandom(player1, player2);
    this.white_player = this.black_player === player1 ? player2 : player1;

    const starting_turn = twoRandom(PIECE.BLACK, PIECE.WHITE);
    this.game = new DropPhaseGame(width, height, starting_turn);
  }

  // convert phase to how it should be returned by the server
  standardizedPhase() {
    if (this.phase === PHASE.DROP) {
      return "drop";
    }
    if (this.phase === PHASE.MOVE) {
      return "move";
    }
  }

  standardizedStep() {
    if (this.phase === PHASE.MOVE) {
      const step = this.game.getStep();
      if (step === STEP.FROM) {
        return "from";
      }
      if (step === STEP.TO) {
        return "to";
      }
      if (step === STEP.TAKE) {
        return "take";
      }
    }
  }

  // plays the move based on phase
  play(player, x, y) {
    if (
      (this.game.getTurn() === PIECE.BLACK && this.black_player !== player) ||
      (this.game.getTurn() === PIECE.WHITE && this.white_player !== player)
    ) {
      throw new Error(`Invalid player ${player}: Not currently playing`);
    }

    let won = false;
    if (this.phase === PHASE.DROP) {
      const phase_ended = this.game.play(x, y);
      if (phase_ended) {
        this.phase === PHASE.MOVE;
        this.game = new MovePhaseGame(this.game);
      }
    } else if (this.phase === PHASE.MOVE) {
      won = this.game.play(x, y);
    }

    // return data in a way that it should be given by update
    return {
      move: {
        row: y,
        column: x,
      },
      board: this.game.getBoard().intoText(),
      phase: this.standardizedPhase(),
      step: this.standardizedStep(),
      players: {
        [this.black_player]: "black",
        [this.white_player]: "white",
      },
      turn:
        this.game.getTurn() === PIECE.BLACK
          ? this.black_player
          : this.white_player,
      winner: won ? player : undefined,
    };
  }
}
