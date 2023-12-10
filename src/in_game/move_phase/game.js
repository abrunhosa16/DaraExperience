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

const oppositeTurn = (turn) => {
  return turn === PIECE.BLACK ? PIECE.WHITE : PIECE.BLACK;
};

export default class MovePhaseGame {
  constructor(drop_phase_game) {
    this.board = drop_phase_game.board;
    this.turn = drop_phase_game.turn;

    this.black_last_move = null;
    this.white_last_move = null;

    this.white_left = 12;
    this.black_left = 12;
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

    const finish = () => {
      if (this.turn === PIECE.BLACK) {
        this.black_last_move = [xi, yi, xf, yf];
      } else {
        this.white_last_move = [xi, yi, xf, yf];
      }
      this.turn = oppositeTurn(this.turn);
    };

    this.board.move(xi, yi, xf, yf);
    if (make < MAX_LINE_COUNT) {
      finish();
      return null;
    } else {
      return (x, y) => {
        if (this.board.empty(x, y)) {
          throw Error("The selected cell for removal is empty");
        }
        if (this.board.get(x, y) !== oppositeTurn(this.turn)) {
          throw Error("The selected piece for removal is not of an enemy one");
        }
        this.board.remove(x, y);

        finish();
      };
    }
  }

  play_unchecked(xi, yi, xf, yf) {
    this.board.move(xi, yi, xf, yf);
    if (this.turn === PIECE.BLACK) {
      this.black_last_move = [xi, yi, xf, yf];
    } else {
      this.white_last_move = [xi, yi, xf, yf];
    }
    this.turn = oppositeTurn(this.turn);
  }

  play_unchecked_and_remove(xi, yi, xf, yf, xr, yr) {
    this.board.move(xi, yi, xf, yf);
    this.board.remove(xr, yr);
    if (this.turn === PIECE.BLACK) {
      this.black_last_move = [xi, yi, xf, yf];
    } else {
      this.white_last_move = [xi, yi, xf, yf];
    }
    this.turn = oppositeTurn(this.turn);
  }

  getMoveList() {
    const moves = [];
    for (let y = 0; y < this.board.height(); y += 1) {
      for (let x = 0; x < this.board.width(); x += 1) {
        if (this.board.get(x, y) === this.turn) {
          const up = this.board.canMoveUp(x, y);
          const down = this.board.canMoveDown(x, y);
          const left = this.board.canMoveLeft(x, y);
          const right = this.board.canMoveRight(x, y);
          if (up !== null) {
            moves.push({
              xi: x,
              yi: y,
              xf: x,
              yf: y - 1,
              makes: up,
              takes: up === MAX_LINE_COUNT,
            });
          }
          if (down !== null) {
            moves.push({
              xi: x,
              yi: y,
              xf: x,
              yf: y + 1,
              makes: down,
              takes: down === MAX_LINE_COUNT,
            });
          }
          if (left !== null) {
            moves.push({
              xi: x,
              yi: y,
              xf: x - 1,
              yf: y,
              makes: left,
              takes: left === MAX_LINE_COUNT,
            });
          }
          if (right !== null) {
            moves.push({
              xi: x,
              yi: y,
              xf: x + 1,
              yf: y,
              makes: right,
              takes: right === MAX_LINE_COUNT,
            });
          }
        }
      }
    }
    return moves.filter(
      ({ xi, yi, xf, yf }) => !this.lastMoveOpposite(xi, yi, xf, yf)
    );
  }

  playRandomMove() {
    const move_list = this.getMoveList();
    console.log(move_list);
    const i = Math.floor(Math.random() * move_list.length);
    const move = move_list[i];
    console.log(move);
    if (move.takes) {
      const enemy_positions = this.board.getPositions(oppositeTurn(this.turn));
      const [xr, yr] =
        enemy_positions[Math.floor(Math.random() * enemy_positions.length)];

      this.play_unchecked_and_remove(
        move.xi,
        move.yi,
        move.xf,
        move.yf,
        xr,
        yr
      );

      return { ...move, xr: xr, yr: yr };
    } else {
      this.play_unchecked(move.xi, move.yi, move.xf, move.yf);
      return move;
    }
  }
}
