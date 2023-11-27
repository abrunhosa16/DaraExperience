import Board, { PIECE } from "./board";

export default class PlacePhaseGame {
  constructor(width, height, starting_turn) {
    this.board = new Board(width, height);
    this.turn = starting_turn === "black" ? PIECE.BLACK : PIECE.WHITE;

    this.drop_count = 24; // 12 * 2

    // contains a list of explicitly invalid positions
    this.white_invalid = [];
    this.black_invalid = [];
  }

  update_invalid(x, y, up, down, left, right) {
    const ver_size = up + down + 1;
    const hor_size = left + right + 1;

    const invalid =
      this.turn === PIECE.BLACK ? this.black_invalid : this.white_invalid;

    if (
      y > up && // inside bounds
      this.board.empty(x, y - up - 1) &&
      (ver_size === 3 || // the size is already 3
        this.board.countUp(x, y - up - 1, this.turn) + ver_size >= 3) // the size counting with adjacent is 3 or bigger
    ) {
      invalid.push([x, y - up - 1]);
    }

    if (
      y + down + 1 < this.board.height() && // inside bounds
      this.board.empty(x, y + down + 1) &&
      (ver_size === 3 || // the size is already 3
        this.board.countDown(x, y + down + 1, this.turn) + ver_size >= 3) // the size counting with adjacent is 3 or bigger
    ) {
      invalid.push([x, y + down + 1]);
    }

    if (
      x > left && // inside bounds
      this.board.empty(x - left - 1, y) &&
      (hor_size === 3 || // the size is already 3
        this.board.countLeft(x - left - 1, y, this.turn) + hor_size >= 3) // the size counting with adjacent is 3 or bigger
    ) {
      invalid.push([x - left - 1, y]);
    }

    if (
      x + right + 1 < this.board.width() && // inside bounds
      this.board.empty(x + right + 1, y) &&
      (hor_size === 3 || // the size is already 3
        this.board.countRight(x + right + 1, y, this.turn) + hor_size >= 3) // the size counting with adjacent is 3 or bigger
    ) {
      invalid.push([x + right + 1, y]);
    }
  }

  play_unchecked_and_not_update_invalid(x, y) {
    // just set state and not update anything else
    this.board.set(x, y, turn);
    this.drop_count -= 1;
    this.turn = turn === PIECE.BLACK ? PIECE.WHITE : PIECE.BLACK;

    return this.drop_count === 0;
  }

  // returns true if phase ended
  play_unchecked(x, y) {
    if (this.drop_count === 0) {
      console.warn("Trying to play in place phase when it has already ended");
      return true;
    }

    this.update_invalid(
      x,
      y,
      this.board.countUp(x, y, this.turn),
      this.board.countDown(x, y, this.turn),
      this.board.countLeft(x, y, this.turn),
      this.board.countRight(x, y, this.turn)
    );

    return this.play_unchecked_and_not_update_invalid(x, y);
  }

  play(x, y) {
    if (this.drop_count === 0) {
      console.warn("Trying to play in place phase when it has already ended");

      return {
        phase_ended: true,
        new_invalid: [],
      };
    }

    if (!this.board.empty(x, y)) {
      throw new Error("This cell is not empty!");
    }

    const up = this.board.countUp(x, y, this.turn);
    const down = this.board.countDown(x, y, this.turn);
    const left = this.board.countLeft(x, y, this.turn);
    const right = this.board.countRight(x, y, this.turn);
    const ver_size = up + down + 1;
    const hor_size = left + right + 1;

    if (ver_size > 3 || hor_size > 3) {
      throw new Error("Cannot place 3 in a line!");
    }

    this.update_invalid(x, y, up, down, left, right);

    return this.play_unchecked_and_not_update_invalid(x, y);
  }
}
