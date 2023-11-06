("use strict");

export const adjacent = (xi, yi, xf, yf) => {
  return Math.abs(xf - xi) + Math.abs(yf - yi) === 1;
};

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
    const life_rights = this.get(xi, yi);
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
    return this.black_turn ? "Black" : "White";
  }

  getCurrentTurnUnbiased(black_turn) {
    return black_turn ? "Black" : "White";
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

  get_board() {
    return this.board;
  }

  countUpUnbiased(x, y, black_turn) {
    let count = 0;
    for (let y_c = y - 1; y_c >= 0; y_c--) {
      if (this.get(x, y_c) === black_turn) {
        count += 1;
      } else {
        break;
      }
    }

    return count;
  }

  countUp(x, y) {
    return this.countUpUnbiased(x, y, this.isTurnBlack());
  }

  countDownUnbiased(x, y, black_turn) {
    let count = 0;
    for (let y_c = y + 1; y_c < this.height(); y_c++) {
      if (this.get(x, y_c) === black_turn) {
        count += 1;
      } else {
        break;
      }
    }

    return count;
  }

  countDown(x, y) {
    return this.countDownUnbiased(x, y, this.isTurnBlack());
  }

  countLeftUnbiased(x, y, black_turn) {
    let count = 0;
    for (let x_c = x - 1; x_c >= 0; x_c--) {
      if (this.get(x_c, y) === black_turn) {
        count += 1;
      } else {
        break;
      }
    }

    return count;
  }

  countLeft(x, y) {
    return this.countLeftUnbiased(x, y, this.isTurnBlack());
  }

  countRightUnbiased(x, y, black_turn) {
    let count = 0;
    for (let x_c = x + 1; x_c < this.width(); x_c++) {
      if (this.get(x_c, y) === black_turn) {
        count += 1;
      } else {
        break;
      }
    }

    return count;
  }

  countRight(x, y) {
    return this.countRightUnbiased(x, y, this.isTurnBlack());
  }
}

export class MoveBoard extends Board {
  constructor(config, drop_board) {
    super(drop_board.get_board(), drop_board.isTurnBlack());

    this.black_play_count = config.black_count;
    this.white_play_count = config.white_count;

    this.last_black_move = null;
    this.last_white_move = null;
  }

  lastMoveTestValid(xi, yi, xf, yf) {
    const black_turn = super.get(xi, yi);

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
  play(xi, yi, xf, yf) {
    if (!super.ally(xi, yi)) {
      throw Error("The selected piece is not owned or doesn't exist");
    }

    if (!super.empty(xf, yf)) {
      throw Error("Invalid destination: Not empty");
    }

    if (!adjacent(xi, yi, xf, yf)) {
      throw Error("Invalid destination: Not adjacent");
    }

    if (!this.lastMoveTestValid(xi, yi, xf, yf)) {
      throw Error(
        "Invalid destination: A piece cannot return to the position from where it was played last turn"
      );
    }

    let going_to_make = 0;
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
      const perpendicular = super.countLeft(xf, yf) + super.countRight(xf, yf) + 1;
      const parallel = super.countDown(xf, yf) + 1;
      going_to_make = Math.max(perpendicular, parallel);
    } else if (yf < yi) {
      // up
      const perpendicular = super.countLeft(xf, yf) + super.countRight(xf, yf) + 1;
      const parallel = super.countUp(xf, yf) + 1;
      going_to_make = Math.max(perpendicular, parallel);
    }

    if (going_to_make > 3) {
      throw Error(
        "Invalid destination: You cannot form lines of 4 or more"
      );
    }
    const made_3 = going_to_make === 3;

    if (super.isTurnBlack()) {
      this.last_black_move = [xi, yi, xf, yf];
    } else {
      this.last_white_move = [xi, yi, xf, yf];
    }

    super.teleport(xi, yi, xf, yf);

    if (!made_3) {
      super.switchTurns();
    }

    return {
      made_3: made_3
    };
  }

  remove(x, y) {
    super.disintegrate(x, y);

    let won = false;
    if (super.isTurnBlack()) {
      this.white_play_count -= 1;
      won = this.white_play_count === 2;
    } else {
      this.black_play_count -= 1;
      won = this.black_play_count === 2;
    }
    if (won) {
      return this.isTurnBlack();
    }

    super.switchTurns();

    return null;
  }

  playRandomly() {
    // TODO
    let i = 0;
    while (true) {
      const xi = Math.floor(Math.random() * super.width());
      const yi = Math.floor(Math.random() * super.height());
      let xf = xi;
      let yf = yi;
      if (Math.random() > 0.5) {
        xf += Math.random() > 0.5 ? 1 : -1;
      } else {
        yf += Math.random() > 0.5 ? 1 : -1;
      }

      try {
        const results = this.play(xf, yf, xf, yf);
        return {
          ...results,
          xi: xi,
          yi: yi,
          xf: xf,
          yf: yf
        };
      } catch (err) {}
    }
  }

  // margins are tested here
  canMoveUp(x, y) {
    if (y === 0) {
      return false;
    }
    const yf = y - 1;
    return (
      super.empty(x, yf) &&
      this.lastMoveTestValid(x, y, x, yf) &&
      super.countLeft(x, yf) + super.countRight(x, yf) < 3 &&
      super.countUp(x, yf) < 3
    );
  }

  canMoveDown(x, y) {
    if (y + 1 === super.height()) {
      return false;
    }
    const yf = y + 1;
    return (
      super.empty(x, yf) &&
      this.lastMoveTestValid(x, y, x, yf) &&
      super.countLeft(x, yf) + super.countRight(x, yf) < 3 &&
      super.countUp(x, yf) < 3
    );
  }

  canMoveLeft(x, y) {
    if (x === 0) {
      return false;
    }
    const xf = x - 1;
    return (
      super.empty(xf, y) &&
      this.lastMoveTestValid(x, y, xf, y) &&
      super.countUp(xf, y) + super.countDown(xf, y) < 3 &&
      super.countLeft(xf, y) < 3
    );
  }

  canMoveRight(x, y) {
    if (x + 1 === super.width()) {
      return false;
    }
    const xf = x + 1;
    return (
      super.empty(xf, y) &&
      this.lastMoveTestValid(x, y, xf, y) &&
      super.countUp(xf, y) + super.countDown(xf, y) < 3 &&
      super.countRight(xf, y) < 3
    );
  }
}

export class DropBoard extends Board {
  constructor(config) {
    super(...Board.fromConfig(config));

    this.black_drop_count = config.black_count;
    this.white_drop_count = config.white_count;
  }

  validPlay(x, y) {
    // gets somewhat repeated in play
    if (!super.empty(x, y)) {
      return false;
    }

    const ver_size = super.countUp(x, y) + super.countDown(x, y) + 1;
    const hor_size = super.countLeft(x, y) + super.countRight(x, y) + 1;
    if (ver_size > 3 || hor_size > 3) {
      return false;
    }

    return true;
  }

  calculateNewInvalids(x, y, up, down, left, right) {
    const ver_size = up + down + 1;
    const hor_size = left + right + 1;

    let new_invalid = [];
    if (
      y > up && // inside bounds
      super.empty(x, y - up - 1) &&
      (ver_size == 3 || // the size is already 3
        super.countUp(x, y - up - 1) + ver_size >= 3) // the size counting with adjacent is 3 or bigger
    ) {
      new_invalid.push([x, y - up - 1]);
    }

    if (
      y + down + 1 < super.height() && // inside bounds
      super.empty(x, y + down + 1) &&
      (ver_size == 3 || // the size is already 3
        super.countDown(x, y + down + 1) + ver_size >= 3) // the size counting with adjacent is 3 or bigger
    ) {
      new_invalid.push([x, y + down + 1]);
    }

    if (
      x > left && // inside bounds
      super.empty(x - left - 1, y) &&
      (hor_size == 3 || // the size is already 3
        super.countLeft(x - left - 1, y) + hor_size >= 3) // the size counting with adjacent is 3 or bigger
    ) {
      new_invalid.push([x - left - 1, y]);
    }

    if (
      x + right + 1 < super.width() && // inside bounds
      super.empty(x + right + 1, y) &&
      (hor_size == 3 || // the size is already 3
        super.countRight(x + right + 1, y) + hor_size >= 3) // the size counting with adjacent is 3 or bigger
    ) {
      new_invalid.push([x + right + 1, y]);
    }

    return new_invalid;
  }

  playRandomly() {
    // as crude as you can get
    let i = 0;
    while (true) {
      const x = Math.floor(Math.random() * super.width());
      const y = Math.floor(Math.random() * super.height());
      try {
        const results = this.play(x, y);
        return {
          ...results,
          x: x,
          y: y,
        };
      } catch (err) {}
    }
  }

  play(x, y) {
    if (!super.empty(x, y)) {
      throw new Error("This cell is not empty!");
    }

    const cur_turn_black = super.isTurnBlack();

    const up = super.countUp(x, y);
    const down = super.countDown(x, y);
    const left = super.countLeft(x, y);
    const right = super.countRight(x, y);
    const ver_size = up + down + 1;
    const hor_size = left + right + 1;

    if (ver_size > 3 || hor_size > 3) {
      throw new Error("3 in a line are just not possible");
    }

    super.recruit(x, y);
    if (cur_turn_black) {
      this.black_drop_count -= 1;
    } else {
      this.white_drop_count -= 1;
    }

    const new_invalid = this.calculateNewInvalids(
      x,
      y,
      up,
      down,
      left,
      right,
      cur_turn_black
    );

    super.switchTurns();

    return {
      phase_ended: this.black_drop_count + this.white_drop_count === 0,
      new_invalid: new_invalid,
    };
  }
}
