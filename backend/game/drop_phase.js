import Board, { MAX_LINE_COUNT, PIECE } from "./board.js";

export default class DropPhaseGame {
  constructor(width, height, starting_turn) {
    this.board = new Board(width, height);
    this.turn = starting_turn === "black" ? PIECE.BLACK : PIECE.WHITE;

    this.drop_count = 24; // 12 * 2
  }

  getTurn() {
    return this.turn;
  }

  getBoard() {
    return this.board;
  }

  play(x, y) {
    if (this.drop_count === 0) {
      throw new Error(
        "Trying to play in place phase while it had already ended"
      );
    }

    if (!this.board.empty(x, y)) {
      throw new Error("This cell is not empty!");
    }

    if (!this.board.validToPlace(x, y, this.turn)) {
      throw new Error(`Cannot place ${MAX_LINE_COUNT} in a line!`);
    }

    this.board.place(x, y, this.turn);

    this.drop_count -= 1;
    this.turn = this.turn === PIECE.BLACK ? PIECE.WHITE : PIECE.BLACK;

    return this.drop_count === 0;
  }

  validPlay(x, y) {
    return this.board.validToPlace(x, y, this.turn);
  }
}
