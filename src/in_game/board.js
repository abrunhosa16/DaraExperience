export const PIECE = {
  NOTHING: 0,
  BLACK: 1,
  WHITE: 2,
};

// maximum number of pieces that can be in a line
const MAX_LINE_COUNT = 3;

export default class Board {
  static createBoard(width, height) {
    const rows = [];
    for (let i = 0; i < height; i++) {
      const row = [];
      for (let j = 0; j < width; j++) {
        row.push(PIECE.NOTHING);
      }
      rows.push(row);
    }
    return rows;
  }

  constructor(width, height) {
    this.d = Board.createBoard(width, height);
  }

  get(x, y) {
    return this.d[y][x];
  }

  set(x, y, val) {
    this.d[y][x] = val;
  }

  remove(x, y) {
    this.set(x, y, PIECE.NOTHING);
  }

  set_black(x, y) {
    this.set(x, y, PIECE.BLACK);
  }

  set_white(x, y) {
    this.set(x, y, PIECE.WHITE);
  }

  move(xi, yi, xf, yf) {
    // qualia transfer was never an option
    const piece = this.get(xi, yi);
    this.remove(xi, yi);
    this.set(xf, yf, piece);
  }

  width() {
    return this.d[0].length;
  }

  height() {
    return this.d.length;
  }

  empty(x, y) {
    return this.get(x, y) === PIECE.NOTHING;
  }

  get_board() {
    return this.d;
  }

  // counts the number of pieces equal to <piece> up
  countUp(x, y, piece) {
    let count = 0;
    for (let y_c = y - 1; y_c >= 0; y_c--) {
      if (this.get(x, y_c) === piece) {
        count += 1;
      } else {
        break;
      }
    }

    return count;
  }

  countDown(x, y, piece) {
    let count = 0;
    for (let y_c = y + 1; y_c < this.height(); y_c++) {
      if (this.get(x, y_c) === piece) {
        count += 1;
      } else {
        break;
      }
    }

    return count;
  }

  countLeft(x, y, piece) {
    let count = 0;
    for (let x_c = x - 1; x_c >= 0; x_c--) {
      if (this.get(x_c, y) === piece) {
        count += 1;
      } else {
        break;
      }
    }

    return count;
  }

  countRight(x, y, piece) {
    let count = 0;
    for (let x_c = x + 1; x_c < this.width(); x_c++) {
      if (this.get(x_c, y) === piece) {
        count += 1;
      } else {
        break;
      }
    }

    return count;
  }

  // test if piece can move in a direction and not make more than MAX_LINE_COUNT
  canMoveUp(x, y) {
    if (y === 0) {
      return false;
    }
    const yf = y - 1;
    const piece = this.get(x, y);
    return (
      this.empty(x, yf) &&
      this.countLeft(x, yf, piece) + this.countRight(x, yf, piece) <
        MAX_LINE_COUNT &&
      this.countUp(x, yf, piece) < MAX_LINE_COUNT
    );
  }

  canMoveDown(x, y) {
    if (y + 1 === this.height()) {
      return false;
    }
    const yf = y + 1;
    const piece = this.get(x, y);
    return (
      this.empty(x, yf) &&
      this.countLeft(x, yf, piece) + super.countRight(x, yf, piece) <
        MAX_LINE_COUNT &&
      this.countUp(x, yf, piece) < MAX_LINE_COUNT
    );
  }

  canMoveLeft(x, y) {
    if (x === 0) {
      return false;
    }
    const xf = x - 1;
    const piece = this.get(x, y);
    return (
      this.empty(xf, y) &&
      this.countUp(xf, y, piece) + this.countDown(xf, y, piece) <
        MAX_LINE_COUNT &&
      super.countLeft(xf, y, piece) < MAX_LINE_COUNT
    );
  }

  canMoveRight(x, y) {
    if (x + 1 === this.width()) {
      return false;
    }
    const xf = x + 1;
    const piece = this.get(x, y);
    return (
      this.empty(xf, y) &&
      this.countUp(xf, y, piece) + this.countDown(xf, y, piece) <
        MAX_LINE_COUNT &&
      this.countRight(xf, y, piece) < MAX_LINE_COUNT
    );
  }
}
