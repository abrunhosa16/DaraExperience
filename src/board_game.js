
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

  playDropPhase(row, col) {
    // Should play as current players's turn and return if the game drop phase has ended
    // ----------------
    // Returns [<true if black's turn, false otherwise>, drop_phase_ended]
    // Throws an error if the operation is invalid (with a message)

    if (this.board[row][col] !== null) {
      throw new Error("This cell is already occupied");
    }
    if (!this.countAdjacent(row, col) || !this.countColumn(row, col)) {
      throw new Error("Not possible more than 3 in line")
    }
    const black_turn = this.black_turn;

    this.board[row][col] = black_turn;
    this.black_turn = !black_turn;

    return [black_turn, false];
  }

  countAdjacent(row, col) {
    const width = this.board.length;
    let acc = 0;
    for (let i = row - 1; i > 0; i--) {
      if (this.board[i][col] === this.black_turn) {
        acc += 1;
      }
      else {
        break;
      }
    }
    for (let j = row + 1; j < width; j++) {
      if (this.board[j][col] === this.black_turn) {
        acc += 1;
      }
      else {
        break;
      }
  
    }
    return acc < 3;
  }
  
  countColumn(row, col) {
    const height = this.board[0].length;
    let acc = 0;
    for (let i = col - 1; i > 0; i--) {
      if (board[row][col] === this.black_turn) {
        acc += 1;
      }
      else {
        break;
      }
    }
    for (let j = col + 1; j < height; j++) {
      if (this.board[row][j] === this.black_turn) {
        acc += 1;
      }
      else {
        break;
      }
  
    }
    if (acc < 3) {
      return true;
    }
    else {
      return false;
    }
  }
}
