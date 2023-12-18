import { MAX_LINE_COUNT, PIECE } from "./board.js";

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

const oppositeTurn = (turn) => {
  return turn === PIECE.BLACK ? PIECE.WHITE : PIECE.BLACK;
};

// This class operates differently from fronted in a sense that it does
//    everything in steps
export const STEP = {
  FROM: "From",
  TO: "To",
  TAKE: "Take",
};

export default class MovePhaseGame {
  constructor(drop_phase_game) {
    this.board = drop_phase_game.board;
    this.turn = drop_phase_game.turn;

    this.black_last_move = null;
    this.white_last_move = null;

    this.white_left = 12;
    this.black_left = 12;

    this.step = STEP.FROM;
    this.xi = null;
    this.yi = null;
  }

  getTurn() {
    return this.turn;
  }

  getBoard() {
    return this.board;
  }
  
  getStep() {
    return this.step;
  }

  // returns true if this move is the opposite of the last (same player)
  lastMoveOpposite(xi, yi, xf, yf) {
    const last_move =
      this.turn === PIECE.BLACK ? this.black_last_move : this.white_last_move;
    if (last_move !== null) {
      const [lxi, lyi, lxf, lyf] = last_move;
      // last dest is equal to init and last init is equal to dest
      if (lxf === xi && lyf === yi && lxi === xf && lyi === yf) {
        return true;
      }
    }

    return false;
  }

  play(x, y) {
    if (this.step === STEP.FROM) {
      if (this.board.get(xi, yi) !== this.turn) {
        throw Error("The selected piece is not owned or doesn't exist");
      }

      this.xi = x;
      this.yi = y;
      this.step === STEP.TO;

      return false;
    } else if (this.step === STEP.TO) {
      if (x === this.xi && y === this.yi) {
        this.step === STEP.FROM;
        this.xi = null;
        this.yi = null;
        return;
      }

      const xi = this.xi;
      const yi = this.xf;
      const xf = x;
      const yf = y;

      if (!this.board.empty(xf, yf)) {
        throw Error("Invalid destination: Not empty");
      }

      if (!adjacent(xi, yi, xf, yf)) {
        throw Error("Invalid destination: Not adjacent");
      }

      if (this.lastMoveOpposite(xi, yi, xf, yf)) {
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
      if (this.turn === PIECE.BLACK) {
        this.black_last_move = [xi, yi, xf, yf];
      } else {
        this.white_last_move = [xi, yi, xf, yf];
      }

      // test if a piece gets taken
      if (make < MAX_LINE_COUNT) {
        this.turn = oppositeTurn(this.turn);

        this.step === STEP.FROM;
      } else {
        this.step === STEP.TAKE;
      }

      return false;
    } else if (this.step === STEP.TAKE) {
      if (this.board.empty(x, y)) {
        throw Error("The selected cell for removal is empty");
      }
      if (this.board.get(x, y) !== oppositeTurn(this.turn)) {
        throw Error("The selected piece for removal is not of an enemy one");
      }
      this.board.remove(x, y);

      let won = false;
      if (this.turn === PIECE.BLACK) {
        this.white_left -= 1;
        if (this.white_left < MAX_LINE_COUNT) {
          won = true;
        }
      } else {
        this.black_left -= 1;
        if (this.black_left < MAX_LINE_COUNT) {
          won = true;
        }
      }

      this.turn = oppositeTurn(this.turn);

      return won;
    }
  }
}
