import Board, { PIECE } from "./board.js";

export default class MovePhaseGame {
  constructor(drop_phase_game) {
    this.board = drop_phase_game.board;
    this.turn = drop_phase_game.turn;

    const rows = [];
    for (let y = 0; y < this.board.height(); y++) {
      const row = [];
      for (let x = 0; x < this.board.width(); x++) {
        if (this.board.empty(x, y)) {
          row.push(null);
        } else {
          row.push([
            this.board.canMoveUp(x, y),
            this.board.canMoveDown(x, y),
            this.board.canMoveLeft(x, y),
            this.board.canMoveRight(x, y),
          ]);
        }
      }
      rows.push(row);
    }
    return rows;
  }
}
