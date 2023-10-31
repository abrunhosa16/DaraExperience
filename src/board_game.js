
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

  playDropPhase(x, y) {
    // Should play as current players's turn and return if the game drop phase has ended
    // ----------------
    // Returns [<true if black's turn, false otherwise>, drop_phase_ended]
    // Throws an error if the operation is invalid (with a message)

    if (this.board[y][x] !== null) {
      throw new Error("This cell is already occupied");
    }
    if (this.countHorizontal(x, y) >= 3 || this.countVertical(x, y) >= 3) {
      throw new Error("Not possible more than 3 in line")
    }
    const black_turn = this.black_turn;
    this.board[y][x] = black_turn;
    if (black_turn) {
      this.black_drop_count -= 1;
    } else {
      this.white_drop_count -= 1;
    }

    this.black_turn = !black_turn;

    return [black_turn, this.black_drop_count + this.white_drop_count === 0];
  }

  // counts adjacent vertical pieces if one is placed in that position
  countVertical(x, y) {
    let count = 0;

    // count up
    for (let y_c = y - 1; y_c > 0; y_c--) {
      if (this.board[y_c][x] === this.black_turn) {
        count += 1;
      } else {
        break;
      }
    }

    // count down
    const height = this.board.length;
    for (let y_c = y + 1; y_c < height - 1; y_c++) {
      if (this.board[y_c][x] === this.black_turn) {
        count += 1;
      } else {
        break;
      }
    }

    return count;
  }

  // counts adjacent horizontal pieces if one is placed in that position
  countHorizontal(x, y) {
    let count = 0;

    // count left
    for (let x_c = x - 1; x_c > 0; x_c--) {
      if (this.board[y][x_c] === this.black_turn) {
        count += 1;
      } else {
        break;
      }
    }

    // count right
    const width = this.board[0].length;
    for (let x_c = x + 1; x_c < width - 1; x_c++) {
      if (this.board[y][x_c] === this.black_turn) {
        count += 1;
      } else {
        break;
      }
    }

    return count;
  }
}
