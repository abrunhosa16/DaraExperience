import Board, { MAX_LINE_COUNT, PIECE } from "./board.js";

export default class DropPhaseGame {
  constructor(width, height, starting_turn) {
    this.board = new Board(width, height);
    this.turn = starting_turn === "black" ? PIECE.BLACK : PIECE.WHITE;

    this.drop_count = 24; // 12 * 2

    // contains a list of explicitly invalid positions
    // (that are in empty cells)
    this.white_invalid = [];
    this.black_invalid = [];
  }

  // get invalid positions for the current turn
  getCurrentInvalid() {
    return this.turn === PIECE.BLACK ? this.black_invalid : this.white_invalid;
  }

  // get invalid positions for the other turn
  getOtherInvalid() {
    return this.turn === PIECE.BLACK ? this.white_invalid : this.black_invalid;
  }

  // should be called after placing the specific piece
  update_invalid(x, y, piece) {
    const [invalid, other] =
      piece === PIECE.BLACK
        ? [this.black_invalid, this.white_invalid]
        : [this.white_invalid, this.black_invalid];
    console.log("invalid", invalid);
    console.log("other", other);

    // remove other invalid if the new piece is being placed there
    const other_i = other.findIndex(([x_c, y_c]) => x === x_c && y === y_c);
    if (other_i !== -1) {
      // if so remove
      other.splice(other_i, 1);
    }

    const { up, down, left, right } = this.board.data(x, y);
    // console.log([this.black_invalid, this.white_invalid], {
    //   up: up,
    //   down: down,
    //   left: left,
    //   right: right,
    // });
    // console.log(this.board.d);
    console.log(piece === PIECE.BLACK ? "black" : "white", x, y);
    const y_up = y - up - 1;
    if (
      y_up >= 0 &&
      this.board.empty(x, y_up) &&
      !this.board.validToPlace(x, y_up, piece) &&
      invalid.findIndex(([x_c, y_c]) => x === x_c && y_up === y_c) === -1
    ) {
      invalid.push([x, y_up]);
    }
    const y_down = y + down + 1;
    if (
      y_down < this.board.height() &&
      this.board.empty(x, y_down) &&
      !this.board.validToPlace(x, y_down, piece) &&
      invalid.findIndex(([x_c, y_c]) => x === x_c && y_down === y_c) === -1
    ) {
      invalid.push([x, y_down]);
    }
    const x_left = x - left - 1;
    if (
      x_left >= 0 &&
      this.board.empty(x_left, y) &&
      !this.board.validToPlace(x_left, y, piece) &&
      invalid.findIndex(([x_c, y_c]) => x_left === x_c && y === y_c) === -1
    ) {
      invalid.push([x_left, y]);
    }
    const x_right = x + right + 1;
    if (
      x_right < this.board.width() &&
      this.board.empty(x_right, y) &&
      !this.board.validToPlace(x_right, y, piece) &&
      invalid.findIndex(([x_c, y_c]) => x_right === x_c && y === y_c) === -1
    ) {
      invalid.push([x_right, y]);
    }
    console.log("invalid", invalid);
    console.log("other", other);
  }

  // returns true if phase ended
  play_unchecked(x, y) {
    if (this.drop_count === 0) {
      console.warn("Trying to play in place phase when it has already ended");
      return true;
    }

    this.board.place(x, y, this.turn);
    this.update_invalid(x, y, this.turn);

    this.drop_count -= 1;
    this.turn = this.turn === PIECE.BLACK ? PIECE.WHITE : PIECE.BLACK;

    return this.drop_count === 0;
  }

  play(x, y) {
    if (this.drop_count === 0) {
      console.warn("Trying to play in place phase while it had already ended");

      return {
        phase_ended: true,
        new_invalid: [],
      };
    }

    if (!this.board.empty(x, y)) {
      throw new Error("This cell is not empty!");
    }

    if (!this.board.validToPlace(x, y, this.turn)) {
      throw new Error(`Cannot place ${MAX_LINE_COUNT} in a line!`);
    }

    this.board.place(x, y, this.turn);
    this.update_invalid(x, y, this.turn);

    this.drop_count -= 1;
    this.turn = this.turn === PIECE.BLACK ? PIECE.WHITE : PIECE.BLACK;

    return this.drop_count === 0;
  }

  validPlay(x, y) {
    return this.board.validToPlace(x, y, this.turn);
  }

  getMoveList() {
    const moves = [];
    for (let y = 0; y < this.board.height(); y += 1) {
      for (let x = 0; x < this.board.width(); x += 1) {
        if (this.board.validToPlace(x, y, this.turn)) {
          moves.push([x, y]);
        }
      }
    }
    return moves;
  }
}
