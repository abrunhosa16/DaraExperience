import Board, { MAX_LINE_COUNT, PIECE } from "./board.js";
import PossibleMoveMoves, { DIRECTION, getDirection } from "./possible_move_moves.js";

const adjacent = (xi, yi, xf, yf) => {
  return Math.abs(xf - xi) + Math.abs(yf - yi) === 1;
};

export default class MovePhaseGame {
  constructor(drop_phase_game) {
    this.board = drop_phase_game.board;
    this.turn = drop_phase_game.turn;

    this.moves = new PossibleMoveMoves(this.board);

    this.black_last_move = null;
    this.white_last_move = null;
  }

  // returns false if this move is the opposite of the last (same player)
  lastMoveTest(xi, yi, xf, yf) {
    const turn = this.board.get(xi, yi);
    if (turn === PIECE.NOTHING) {
      return false;
    }

    const last_move =
      turn === PIECE.BLACK ? this.black_last_move : this.white_last_move;
    if (last_move !== null) {
      const [lxi, lyi, lxf, lyf] = last_move;
      // last dest is equal to init and last init is equal to dest
      if (lxf === xi && lyf === yi && lxi === xf && lyi === yf) {
        return false;
      }
    }

    return true;
  }

  // all coordinates are expected to be within bounds
  play(xi, yi, xf, yf) {
    if (this.board.get(xi, yi) !== this.turn) {
      throw Error("The selected piece is not owned or doesn't exist");
    }

    if (!this.board.empty(xf, yf)) {
      throw Error("Invalid destination: Not empty");
    }

    if (!adjacent(xi, yi, xf, yf)) {
      throw Error("Invalid destination: Not adjacent");
    }

    if (!this.lastMoveTest(xi, yi, xf, yf)) {
      throw Error(
        "Invalid destination: A piece cannot return to the position from where it was played last turn"
      );
    }

    const direction = getDirection(xi, yi, xf, yf);
    if (!this.moves.canMoveInDirection(xi, yi, direction)) {
      throw Error(
        `Invalid destination: A piece in that direction would make a line that is more than ${MAX_LINE_COUNT}`
      );
    }

    this.board.move(xi, yi, xf, yf);

    switch (direction) {
      case DIRECTION.UP:
        this.moves.updateUp(xf, yf);
        break;
      case DIRECTION.DOWN:
        return this.canMoveDown(x, y);
      case DIRECTION.LEFT:
        return this.canMoveLeft(x, y);
      case DIRECTION.RIGHT:
        return this.canMoveRight(x, y);
    }

    if (xf > xi) {
      // right
      const perpendicular = super.countUp(xf, yf) + super.countDown(xf, yf) + 1;
      const parallel = super.countRight(xf, yf) + 1;
      going_to_make = Math.max(perpendicular, parallel);
    } else if (xf < xi) {
      // left
      const perpendicular = super.countUp(xf, yf) + super.countDown(xf, yf) + 1;
      const parallel = super.countLeft(xf, yf) + 1;
      going_to_make = Math.max(perpendicular, parallel);
    } else if (yf > yi) {
      // down
      const perpendicular =
        super.countLeft(xf, yf) + super.countRight(xf, yf) + 1;
      const parallel = super.countDown(xf, yf) + 1;
      going_to_make = Math.max(perpendicular, parallel);
    } else if (yf < yi) {
      // up
      const perpendicular =
        super.countLeft(xf, yf) + super.countRight(xf, yf) + 1;
      const parallel = super.countUp(xf, yf) + 1;
      going_to_make = Math.max(perpendicular, parallel);
    }
  }
}
