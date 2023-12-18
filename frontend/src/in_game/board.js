export const PIECE = {
  NOTHING: 0,
  BLACK: 1,
  WHITE: 2,
};

// maximum number of pieces that can be in a line
export const MAX_LINE_COUNT = 3;

export default class Board {
  static createBoard(width, height, initial_val) {
    const rows = [];
    for (let i = 0; i < height; i++) {
      const row = [];
      for (let j = 0; j < width; j++) {
        row.push(initial_val);
      }
      rows.push(row);
    }
    return rows;
  }

  constructor(width, height) {
    // up / down / left / right count the number of neighbors of a piece in that direction
    this.d = Board.createBoard(width, height, {
      piece: PIECE.NOTHING,
      up: 0,
      down: 0,
      left: 0,
      right: 0,
    });
  }

  width() {
    return this.d[0].length;
  }

  height() {
    return this.d.length;
  }

  get_matrix() {
    return this.d;
  }

  get(x, y) {
    return this.d[y][x].piece;
  }

  data(x, y) {
    return this.d[y][x];
  }

  empty(x, y) {
    return this.get(x, y) === PIECE.NOTHING;
  }

  upNei(x, y) {
    return this.d[y][x].up;
  }

  downNei(x, y) {
    return this.d[y][x].down;
  }

  leftNei(x, y) {
    return this.d[y][x].left;
  }

  rightNei(x, y) {
    return this.d[y][x].right;
  }

  // does't affect the starting position
  addNeiUp(x, y, nei_amount, val) {
    for (let i = 1; i <= nei_amount; i++) {
      this.d[y - i][x].down += val;
    }
  }

  addNeiDown(x, y, nei_amount, val) {
    for (let i = 1; i <= nei_amount; i++) {
      this.d[y + i][x].up += val;
    }
  }

  addNeiLeft(x, y, nei_amount, val) {
    for (let i = 1; i <= nei_amount; i++) {
      this.d[y][x - i].right += val;
    }
  }

  addNeiRight(x, y, nei_amount, val) {
    for (let i = 1; i <= nei_amount; i++) {
      this.d[y][x + i].left += val;
    }
  }

  // gets the number of connected of <piece> up the given position
  // this is given by the neighbor connected pieces count plus the neighbor itself
  countUp(x, y, piece) {
    if (y > 0 && this.get(x, y - 1) === piece) {
      return this.upNei(x, y - 1) + 1;
    }
    return 0;
  }

  countDown(x, y, piece) {
    if (y + 1 < this.height() && this.get(x, y + 1) === piece) {
      return this.downNei(x, y + 1) + 1;
    }
    return 0;
  }

  countLeft(x, y, piece) {
    if (x > 0 && this.get(x - 1, y) === piece) {
      return this.leftNei(x - 1, y) + 1;
    }
    return 0;
  }

  countRight(x, y, piece) {
    if (x + 1 < this.width() && this.get(x + 1, y) === piece) {
      return this.rightNei(x + 1, y) + 1;
    }
    return 0;
  }

  // place, remove and move do not test for max line rule
  // cell is expected to be empty
  place(x, y, piece) {
    const up = this.countUp(x, y, piece);
    const down = this.countDown(x, y, piece);
    const left = this.countLeft(x, y, piece);
    const right = this.countRight(x, y, piece);
    this.d[y][x] = {
      piece: piece,
      up: up,
      down: down,
      left: left,
      right: right,
    };

    // update neighbors
    this.addNeiUp(x, y, up, 1);
    this.addNeiDown(x, y, down, 1);
    this.addNeiLeft(x, y, left, 1);
    this.addNeiRight(x, y, right, 1);
  }

  validToPlace(x, y, piece) {
    if (!this.empty(x, y)) {
      return false;
    }

    const up = this.countUp(x, y, piece);
    const down = this.countDown(x, y, piece);
    if (up + down + 1 > MAX_LINE_COUNT) {
      return false;
    }

    const left = this.countLeft(x, y, piece);
    const right = this.countRight(x, y, piece);
    if (left + right + 1 > MAX_LINE_COUNT) {
      return false;
    }

    return true;
  }

  remove(x, y) {
    const { up, down, left, right } = this.d[y][x];

    this.addNeiUp(x, y, up, -1 - down);
    this.addNeiDown(x, y, down, -1 - up);
    this.addNeiLeft(x, y, left, -1 - right);
    this.addNeiRight(x, y, right, -1 - left);

    this.d[y][x] = {
      piece: PIECE.NOTHING,
      up: 0,
      down: 0,
      left: 0,
      right: 0,
    };
  }

  move(xi, yi, xf, yf) {
    // qualia transfer was never an option
    const piece = this.get(xi, yi);
    this.remove(xi, yi);
    this.place(xf, yf, piece);
  }

  // test if piece can move in a direction and not make more than MAX_LINE_COUNT
  // returns null if not possible or the maximum number of pieces in a line that would be formed
  canMoveUp(x, y) {
    if (y === 0) {
      return null;
    }
    const yf = y - 1;
    if (!this.empty(x, yf)) {
      return null;
    }

    const piece = this.get(x, y);
    const perpendicular =
      this.countLeft(x, yf, piece) + this.countRight(x, yf, piece) + 1;
    const parallel = this.countUp(x, yf, piece) + 1;

    const m = Math.max(perpendicular, parallel);
    return m > MAX_LINE_COUNT ? null : m;
  }

  canMoveDown(x, y) {
    if (y + 1 === this.height()) {
      return null;
    }
    const yf = y + 1;
    if (!this.empty(x, yf)) {
      return null;
    }

    const piece = this.get(x, y);
    const perpendicular =
      this.countLeft(x, yf, piece) + this.countRight(x, yf, piece) + 1;
    const parallel = this.countDown(x, yf, piece) + 1;

    const m = Math.max(perpendicular, parallel);
    return m > MAX_LINE_COUNT ? null : m;
  }

  canMoveLeft(x, y) {
    if (x === 0) {
      return null;
    }
    const xf = x - 1;
    if (!this.empty(xf, y)) {
      return null;
    }

    const piece = this.get(x, y);
    const perpendicular =
      this.countUp(xf, y, piece) + this.countDown(xf, y, piece) + 1;
    const parallel = this.countLeft(xf, y, piece) + 1;

    const m = Math.max(perpendicular, parallel);
    return m > MAX_LINE_COUNT ? null : m;
  }

  canMoveRight(x, y) {
    if (x + 1 === this.width()) {
      return null;
    }
    const xf = x + 1;
    if (!this.empty(xf, y)) {
      return null;
    }

    const piece = this.get(x, y);
    const perpendicular =
      this.countUp(xf, y, piece) + this.countDown(xf, y, piece) + 1;
    const parallel = this.countRight(xf, y, piece) + 1;

    const m = Math.max(perpendicular, parallel);
    return m > MAX_LINE_COUNT ? null : m;
  }

  getPositions(piece) {
    const positions = [];
    for (let y = 0; y < this.height(); y += 1) {
      for (let x = 0; x < this.width(); x += 1) {
        if (this.get(x, y) === piece) {
          positions.push([x, y]);
        }
      }
    }
    return positions;
  }

}


