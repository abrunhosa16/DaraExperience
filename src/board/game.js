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

  static create(width, height) {
    return new Board(Board.createBoard(width, height));
  }

  constructor(board) {
    this.board = board;
  }

  get(x, y) {
    return this.board[y][x];
  }

  isNull(x, y) {
    return this.get(x, y) === null;
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
}

// export class MoveBoard extends Board {
//   constructor(drop_board) {
//     this.board = drop_board.board;
//     this.black_play_count = drop_board.black_total_pieces;
//     this.white_play_count = drop_board.white_total_pieces;
//     this.black_turn = drop_board.black_turn;
//     this.last_black = null;
//     this.last_white = null;
//   }

//   playMovePhase(xi, yi, xf, yf) {
//     const x_diff = xf - xi;
//     const y_diff = yf - yi;

//     // Se o movimento for valido realiza o movimento

//     if (x_diff === 0 && y_diff === -1) {
//       this.moveUp(x, y);
//     } else if (x_diff === 0 && y_diff === 1) {
//       this.moveDown(x, y);
//     } else if (y_diff === 0 && x_diff === 1) {
//       this.moveRight(x, y);
//     } else if (y_diff === 0 && x_diff === -1) {
//       this.moveLeft(x, y);
//     } else {
//       throw new Error("Not possible move");
//     }
//   }
//   // Testa se a casa esta vazia e realiza o movimento
//   moveUp(x, y) {
//     if (this.canMoveUp(x, y)) {
//       this.set(x, y - 1, this.get(x, y));
//       this.set(x, y, null);
//     }
//   }

//   moveDown(x, y) {
//     if (this.canMoveDown(x, y)) {
//       this.set(x, y + 1, this.get(x, y));
//       this.set(x, y, null);
//     }
//   }

//   moveRight(x, y) {
//     if (this.canMoveRight(x, y)) {
//       this.set(x + 1, y, this.get(x, y));
//       this.set(x, y, null);
//     }
//   }

//   moveLeft(x, y) {
//     if (this.canMoveLeft(x, y)) {
//       this.set(x - 1, y, this.get(x, y));
//       this.set(x, y, null);
//     }
//   }
//   // Testa se a casa esta vazia e dentro das margens
//   canMoveUp(x, y) {
//     if (y === 0) {
//       return false;
//     }
//     if (this.get(x, y - 1) !== null) {
//       return false;
//     }
//     const last_move = this.black_turn ? this.last_black : this.last_white;
//     if (last_move[0] === x && last_move[1] === y - 1) {
//       return false;
//     }
//     return true;
//   }

//   canMoveDown(x, y) {
//     if (y + 1 === this.height) {
//       return false;
//     }
//     if (this.get(x, y + 1) !== null) {
//       return false;
//     }
//     const last_move = this.black_turn ? this.last_black : this.last_white;
//     if (last_move[0] === x && last_move[1] === y + 1) {
//       return false;
//     }
//     return true;
//   }

//   canMoveRight(x, y) {
//     if (x + 1 === this.width) {
//       return false;
//     }
//     if (this.get(x + 1, y) !== null) {
//       return false;
//     }
//     const last_move = this.black_turn ? this.last_black : this.last_white;
//     if (last_move[0] === x + 1 && last_move[1] === y) {
//       return false;
//     }
//     return true;
//   }

//   canMoveLeft(x, y) {
//     if (x === 0) {
//       return false;
//     }
//     if (this.get(x - 1, y) !== null) {
//       return false;
//     }
//     const last_move = this.black_turn ? this.last_black : this.last_white;
//     if (last_move[0] === x - 1 && last_move[1] === y) {
//       return false;
//     }
//     return true;
//   }
// }

export class DropBoard extends Board {
  constructor(configs) {
    // TODO: use Board.create(width, height) instead
    super(Board.createBoard(configs.width, configs.height));

    this.black_drop_count = configs.black_count;
    this.white_drop_count = configs.white_count;
    this.black_turn = DropBoard.getStartingTurnFromGenData(configs);
  }

  static getStartingTurnFromGenData(gen_data) {
    // returns true if black or false if white
    if (gen_data.starting_player === "black") {
      return true;
    }
    if (gen_data.starting_player === "white") {
      return false;
    }
    if (gen_data.starting_player === "random") {
      return Math.random() > 0.5;
    }
    throw new Error("Starting Player Data is invalid");
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
      throw new Error("Not possible more than 3 in line");
    }

    const cur_black_turn = this.black_turn;
    this.set(x, y, cur_black_turn);
    if (cur_black_turn) {
      this.black_drop_count -= 1;
    } else {
      this.white_drop_count -= 1;
    }

    let new_invalid = [];
    if (
      y > up && // inside bounds
      this.isNull(x, y - up - 1) && // it's empty
      (ver_size == 3 || // the size is already 3
        this.countUp(x, y - up - 1) + ver_size >= 3) // the size counting with adjacent is 3 or bigger
    ) {
      new_invalid.push([x, y - up - 1]);
    }

    if (
      y + down + 1 < this.height() && // inside bounds
      this.isNull(x, y + down + 1) && // it's empty
      (ver_size == 3 || // the size is already 3
        this.countDown(x, y + down + 1) + ver_size >= 3) // the size counting with adjacent is 3 or bigger
    ) {
      new_invalid.push([x, y + down + 1]);
    }

    if (
      x > left && // inside bounds
      this.isNull(x - left - 1, y) && // it's empty
      (hor_size == 3 || // the size is already 3
        this.countLeft(x - left - 1, y) + hor_size >= 3) // the size counting with adjacent is 3 or bigger
    ) {
      new_invalid.push([x - left - 1, y]);
    }

    if (
      x + right + 1 < this.width() && // inside bounds
      this.isNull(x + right + 1, y) && // it's empty
      (hor_size == 3 || // the size is already 3
        this.countRight(x + right + 1, y) + hor_size >= 3) // the size counting with adjacent is 3 or bigger
    ) {
      new_invalid.push([x + right + 1, y]);
    }

    this.black_turn = !cur_black_turn;

    return {
      phase_ended: this.black_drop_count + this.white_drop_count === 0,
      new_invalid: new_invalid,
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
