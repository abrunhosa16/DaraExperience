
("use strict");

export class Board {
  constructor(configs) {
    this.black_drop_count = configs.black_count;
    this.white_drop_count = configs.white_count;
    this.black_turn = Board.getStartingTurnFromGenData(configs);
    this.board = Board.createBoard(configs.width, configs.height);
  }

  static getStartingTurnFromGenData(gen_data) {
    // returns true if black or false if white
    if (gen_data.starting_player === "black") {
      return true
    }
    if (gen_data.starting_player === "white") {
      return false;
    }
    if (gen_data.starting_player === "random") {
      return Math.random() > 0.5;
    }
    throw new Error('Starting Player Data is invalid')
  }

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

  get(x, y) {
    return this.board[y][x];
  }

  set(x, y, val) {
    this.board[y][x] = val;
  }

  width() {
    return this.board[0].length;
  }

  height() {
    return this.board.length;
  }

  playDropPhase(x, y) {
    // Should play as current players's turn and return if the game drop phase has ended
    // ----------------
    // Returns [<true if black's turn, false otherwise>, drop_phase_ended]
    // Throws an error if the operation is invalid (with a message)

    if (this.get(x, y) !== null) {
      throw new Error("This cell is already occupied");
    }

    const up = this.countUp(x, y);
    const down = this.countDown(x, y);
    const left = this.countLeft(x, y);
    const right = this.countRight(x, y);
    const ver_size = up + down + 1;
    const hor_size = left + right + 1;

    if (ver_size > 3 || hor_size > 3) {
      throw new Error("Not possible more than 3 in line")
    }

    const cur_black_turn = this.black_turn;
    this.set(x, y, cur_black_turn);
    if (cur_black_turn) {
      this.black_drop_count -= 1;
    } else {
      this.white_drop_count -= 1;
    }

    // TODO: maybe simplify this
    let new_invalid = [];
    if (y > up &&                                           // inside bounds
      this.get(x, y - up - 1) === null && (                 // it's empty
        ver_size == 3 ||                                    // the size is already 3
        this.countUp(x, y - up - 1) + ver_size >= 3)        // the size counting with adjacent is 3 or bigger
    ) {
      new_invalid.push([x, y - up - 1]);
    }

    if (y + down + 1 < this.height() &&                     // inside bounds
      this.get(x, y + down + 1) === null && (               // it's empty
        ver_size == 3 ||                                    // the size is already 3
        this.countDown(x, y + down + 1) + ver_size >= 3)    // the size counting with adjacent is 3 or bigger
    ) {
      new_invalid.push([x, y + down + 1]);
    }

    if (x > left &&                                         // inside bounds
      this.get(x - left - 1, y) === null && (               // it's empty
        hor_size == 3 ||                                    // the size is already 3
        this.countLeft(x - left - 1, y) + hor_size >= 3)    // the size counting with adjacent is 3 or bigger
    ) {
      new_invalid.push([x - left - 1, y]);
    }

    if (x + right + 1 < this.width() &&                     // inside bounds
      this.get(x + right + 1, y) === null && (              // it's empty
      hor_size == 3 ||                                      // the size is already 3
        this.countRight(x + right + 1, y) + hor_size >= 3)  // the size counting with adjacent is 3 or bigger
    ) {
      new_invalid.push([x + right + 1, y]);
    }

    this.black_turn = !cur_black_turn;

    return {
      phase_ended: this.black_drop_count + this.white_drop_count === 0,
      new_invalid: new_invalid
    };
  }

  countUp(x, y) {
    let count = 0;
    for (let y_c = y - 1; y_c >= 0; y_c--) {
      if (this.get(x, y_c) === this.black_turn) {
        count += 1;
      } else {
        break;
      }
    }

    return count;
  }

  countDown(x, y) {
    let count = 0;
    for (let y_c = y + 1; y_c < this.height(); y_c++) {
      if (this.get(x, y_c) === this.black_turn) {
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
      if (this.get(x_c, y) === this.black_turn) {
        count += 1;
      } else {
        break;
      }
    }

    return count;
  }

  countRight(x, y) {
    let count = 0;
    for (let x_c = x + 1; x_c < this.width(); x_c++) {
      if (this.get(x_c, y) === this.black_turn) {
        count += 1;
      } else {
        break;
      }
    }

    return count;
  }
}
