
export const PIECE = {
  NOTHING: 0,
  BLACK: 1,
  WHITE: 2
}

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
}