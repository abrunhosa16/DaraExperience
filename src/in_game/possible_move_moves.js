const calculatePossibleMoves = (board) => {
  const rows = [];
  for (let y = 0; y < board.height(); y++) {
    const row = [];
    for (let x = 0; x < board.width(); x++) {
      if (board.empty(x, y)) {
        row.push(null);
      } else {
        row.push([
          board.canMoveUp(x, y),
          board.canMoveDown(x, y),
          board.canMoveLeft(x, y),
          board.canMoveRight(x, y),
        ]);
      }
    }
    rows.push(row);
  }
  return rows;
};

export const DIRECTION = {
  UP: 0,
  DOWN: 1,
  LEFT: 2,
  RIGHT: 3,
};

export const getDirection = (xi, yi, xf, yf) => {
  if (yf < yi) {
    return DIRECTION.UP;
  } else if (yf > yi) {
    return DIRECTION.DOWN;
  } else if (xf < xi) {
    return DIRECTION.LEFT;
  } else if (xf > xi) {
    return DIRECTION.RIGHT;
  }
};

export default class PossibleMoveMoves {
  constructor(board) {
    this.d = calculatePossibleMoves(board);
  }

  canMoveUp(x, y) {
    return this.d[y][x][DIRECTION.UP];
  }

  canMoveDown(x, y) {
    return this.d[y][x][DIRECTION.DOWN];
  }

  canMoveLeft(x, y) {
    return this.d[y][x][DIRECTION.LEFT];
  }

  canMoveRight(x, y) {
    return this.d[y][x][DIRECTION.RIGHT];
  }

  canMoveInDirection(x, y, direction) {
    switch (direction) {
      case DIRECTION.UP:
        return this.canMoveUp(x, y);
      case DIRECTION.DOWN:
        return this.canMoveDown(x, y);
      case DIRECTION.LEFT:
        return this.canMoveLeft(x, y);
      case DIRECTION.RIGHT:
        return this.canMoveRight(x, y);
    }
  }

  update(board, x, y) {
    this.d[y][x] = [
      board.canMoveUp(x, y),
      board.canMoveDown(x, y),
      board.canMoveLeft(x, y),
      board.canMoveRight(x, y),
    ];
  }

  // update all in a direction
  updateUp(board, x, y, piece) {
    for (let y_c = y - 1; y_c >= 0; y_c--) {
      if (board.get(x, y_c) === piece) {
        this.update(board, x, y_c);
      } else {
        return;
      }
    }
  }

  updateDown(board, x, y, piece) {
    for (let y_c = y + 1; y_c < board.height(); y_c++) {
      if (board.get(x, y_c) === piece) {
        this.update(board, x, y_c);
      } else {
        return;
      }
    }
  }

  updateLeft(x, y, piece) {
    for (let x_c = x - 1; x_c >= 0; x_c--) {
      if (board.get(x_c, y) === piece) {
        this.update(board, x, y_c);
      } else {
        return;
      }
    }
  }

  updateRight(x, y, piece) {
    for (let x_c = x + 1; x_c < board.width(); x_c++) {
      if (board.get(x_c, y) === piece) {
        this.update(board, x, y_c);
      } else {
        return;
      }
    }
  }
}
