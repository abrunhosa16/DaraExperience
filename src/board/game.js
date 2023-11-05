("use strict");

class Board {
  static createBoard(width, height) {
    const rows = [];
    for (let i = 0; i < height; i++) {
      const row = [];
      for (let j = 0; j < width; j++) {
        row.push(null);
      }
      rows.push(row);
    }
    return rows;
  }

  static getStartingTurn(starting_player) {
    // returns true if black or false if white
    switch (starting_player) {
      case "black":
        return true;
      case "white":
        return false;
      case "random":
        return Math.random() > 0.5;
      default:
        throw new Error("Starting Player Data is invalid");
    }
  }

  constructor(board, black_turn) {
    this.board = board;
    this.black_turn = black_turn;
  }

  static fromConfig(config) {
    return [
      Board.createBoard(config.width, config.height),
      Board.getStartingTurn(config.starting_player),
    ];
  }

  // returns true if black, false if white and null if empty
  get(x, y) {
    return this.board[y][x];
  }

  materialize(x, y, val) {
    this.board[y][x] = val;
  }

  switchTurns() {
    this.black_turn = !this.black_turn;
  }

  // sets the coors with current turn piece
  // if there was already a piece there, that's their problem
  recruit(x, y) {
    this.materialize(x, y, this.black_turn);
  }

  disintegrate(x, y) {
    // empty space also occupies space
    this.materialize(x, y, null);
  }

  teleport(xi, yi, xf, yf) {
    // qualia transfer was never an option
    const life_rights = this.get(xi, xf);
    this.disintegrate(xi, yi);
    this.materialize(xf, yf, life_rights);
  }

  width() {
    return this.board[0].length;
  }

  height() {
    return this.board.length;
  }

  isTurnBlack() {
    return this.black_turn;
  }

  isTurnWhite() {
    return !this.black_turn;
  }

  getCurrentTurn() {
    return this.black_turn ? "black" : "white";
  }

  empty(x, y) {
    return this.get(x, y) === null;
  }

  // returns true if the piece is equal to the current turn
  ally(x, y) {
    return this.get(x, y) === this.black_turn;
  }

  enemy(x, y) {
    return this.get(x, y) !== this.black_turn;
  }
}

export class MoveBoard extends Board {
  constructor(configs, board, black_turn) {
    super(board, black_turn);

    this.black_play_count = configs.black_count;
    this.white_play_count = configs.white_count;

    this.last_black_move = null;
    this.last_white_move = null;
  }

  lastMoveTestValid(xi, yi, xf, yf) {
    const black_turn = super.get(xi, xf);

    if (black_turn === undefined) {
      return undefined;
    }

    const last_move = black_turn ? this.last_black_move : this.last_white_move;
    if (last_move !== null) {
      const [lxi, lyi, lxf, lyf] = last_move;
      // last dest is equal to cur and last cur is equal to dest
      if (lxf === xi && lyf === yi && lxi === xf && lyi === yf) {
        return false;
      }
    }

    return true;
  }

  // all coordinates are expected to be within bounds
  playMovePhase(xi, yi, xf, yf) {
    if (!super.ally(xi, xf)) {
      throw Error("The selected piece is not owned or doesn't exist");
    }

    if (!super.empty(xf, yf)) {
      throw Error("Invalid destination: Not empty");
    }

    const adjacent = Math.abs(xf - xi) + Math.abs(yf - yi) === 1;
    if (!adjacent) {
      throw Error("Invalid destination: Not adjacent");
    }

    if (!this.lastMoveTestValid(xi, yi, xf, yf)) {
      throw Error(
        "Invalid destination: A piece cannot return to the position from where it was played last turn"
      );
    }

    super.teleport(xi, yi, xf, yf);
  }

  // margins are tested here
  canMoveUp(x, y) {
    if (y === 0) {
      return false;
    }
    const yf = y - 1;
    return super.empty(x, yf) && this.lastMoveTestValid(x, y, x, yf);
  }

  canMoveDown(x, y) {
    if (y + 1 === super.height()) {
      return false;
    }
    const yf = y + 1;
    return super.empty(x, yf) && this.lastMoveTestValid(x, y, x, yf);
  }

  canMoveLeft(x, y) {
    if (x === 0) {
      return false;
    }
    const xf = x - 1;
    return super.empty(xf, y) && this.lastMoveTestValid(x, y, xf, y);
  }

  canMoveRight(x, y) {
    if (x + 1 === super.width()) {
      return false;
    }
    const xf = x + 1;
    return super.empty(xf, y) && this.lastMoveTestValid(x, y, xf, y);
  }
}

export class DropBoard extends Board {
  constructor(config) {
    super(...Board.fromConfig(config));

    this.black_drop_count = config.black_count;
    this.white_drop_count = config.white_count;
  }

  validPlay(x, y) {
    // gets somewhat repeated in playDropPhase
    if (!super.empty(x, y)) {
      return false;
    }

    const ver_size = this.countUp(x, y) + this.countDown(x, y) + 1;
    const hor_size = this.countLeft(x, y) + this.countRight(x, y) + 1;
    if (ver_size > 3 || hor_size > 3) {
      return false;
    }

    return true;
  }

  playDropPhase(x, y) {
    if (!super.empty(x, y)) {
      throw new Error("This cell is not empty!");
    }

    const up = this.countUp(x, y);
    const down = this.countDown(x, y);
    const left = this.countLeft(x, y);
    const right = this.countRight(x, y);
    const ver_size = up + down + 1;
    const hor_size = left + right + 1;

    if (ver_size > 3 || hor_size > 3) {
      throw new Error("3 in a line are just not possible");
    }

    super.recruit(x, y);
    if (super.isTurnBlack()) {
      this.black_drop_count -= 1;
    } else {
      this.white_drop_count -= 1;
    }

    let new_invalid = [];
    if (
      y > up && // inside bounds
      super.empty(x, y - up - 1) &&
      (ver_size == 3 || // the size is already 3
        this.countUp(x, y - up - 1) + ver_size >= 3) // the size counting with adjacent is 3 or bigger
    ) {
      new_invalid.push([x, y - up - 1]);
    }

    if (
      y + down + 1 < super.height() && // inside bounds
      super.empty(x, y + down + 1) &&
      (ver_size == 3 || // the size is already 3
        this.countDown(x, y + down + 1) + ver_size >= 3) // the size counting with adjacent is 3 or bigger
    ) {
      new_invalid.push([x, y + down + 1]);
    }

    if (
      x > left && // inside bounds
      super.empty(x - left - 1, y) &&
      (hor_size == 3 || // the size is already 3
        this.countLeft(x - left - 1, y) + hor_size >= 3) // the size counting with adjacent is 3 or bigger
    ) {
      new_invalid.push([x - left - 1, y]);
    }

    if (
      x + right + 1 < super.width() && // inside bounds
      super.empty(x + right + 1, y) &&
      (hor_size == 3 || // the size is already 3
        this.countRight(x + right + 1, y) + hor_size >= 3) // the size counting with adjacent is 3 or bigger
    ) {
      new_invalid.push([x + right + 1, y]);
    }

    super.switchTurns();

    return {
      phase_ended: this.black_drop_count + this.white_drop_count === 0,
      new_invalid: new_invalid,
    };
  }

  countUp(x, y) {
    let count = 0;
    for (let y_c = y - 1; y_c >= 0; y_c--) {
      if (super.ally(x, y_c)) {
        count += 1;
      } else {
        break;
      }
    }

    return count;
  }

  countDown(x, y) {
    let count = 0;
    for (let y_c = y + 1; y_c < super.height(); y_c++) {
      if (super.ally(x, y_c)) {
        count += 1;
      } else {
        break;
      }
    }

    return count;
  }

  countLeft(x, y) {
    let count = 0;
    for (let x_c = x - 1; x_c >= 0; x_c--) {
      if (super.ally(x_c, y)) {
        count += 1;
      } else {
        break;
      }
    }

    return count;
  }

  countRight(x, y) {
    let count = 0;
    for (let x_c = x + 1; x_c < super.width(); x_c++) {
      if (super.ally(x_c, y)) {
        count += 1;
      } else {
        break;
      }
    }

    return count;
  }
}
