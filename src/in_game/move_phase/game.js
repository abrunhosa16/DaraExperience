import Board, { MAX_LINE_COUNT, PIECE } from "../board.js";

const adjacent = (xi, yi, xf, yf) => {
  return Math.abs(xf - xi) + Math.abs(yf - yi) === 1;
};

const DIRECTION = {
  UP: 0,
  DOWN: 1,
  LEFT: 2,
  RIGHT: 3,
};

const getDirection = (xi, yi, xf, yf) => {
  if (yf < yi) {
    return DIRECTION.UP;
  } else if (yf > yi) {
    return DIRECTION.DOWN;
  } else if (xf < xi) {
    return DIRECTION.LEFT;
  } else if (xf > xi) {
    return DIRECTION.RIGHT;
  }
};


export default class MovePhaseGame {
  constructor(drop_phase_game) {
    this.board = drop_phase_game.board;
    this.turn = drop_phase_game.turn;

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

    let make = null;
    switch (getDirection(xi, yi, xf, yf)) {
      case DIRECTION.UP:
        make = this.board.canMoveUp(xi, yi);
        break;
      case DIRECTION.DOWN:
        make = this.board.canMoveDown(xi, yi);
        break;
      case DIRECTION.LEFT:
        make = this.board.canMoveLeft(xi, yi);
        break;
      case DIRECTION.RIGHT:
        make = this.board.canMoveRight(xi, yi);
        break;
    }
    if (make === null) {
      throw Error(
        `Invalid destination: A piece in that direction would make a line that is more than ${MAX_LINE_COUNT}`
      );
    }

    this.board.move(xi, yi, xf, yf);

    console.log(make);

    this.turn = this.turn === PIECE.BLACK ? PIECE.WHITE : PIECE.BLACK;
  }
}
