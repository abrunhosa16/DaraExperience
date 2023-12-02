import Component from "../../component.js";
import { GAME_MODE } from "../area.js";
import { PIECE } from "../board.js";
import MovePhaseGame from "./game.js";

export default class MovePhaseArea extends Component {
  constructor(stage, drop_phase_game, black_mode, white_mode) {
    const base = document.createElement("div");
    const title = document.createElement("h3");
    title.innerHTML = "Move phase";
    base.appendChild(title);
    base.appendChild(stage.el());

    super(base);

    this.stage = stage;

    this.game = new MovePhaseGame(drop_phase_game);
    this.black_mode = black_mode;
    this.white_mode = white_mode;
  }

  async stageClick() {
    return new Promise((resolve, reject) => {
      const ctx = this.stage.addOnClick((res) => {
        if (res !== null) {
          const [x, y] = res;
          const piece = this.game.board.get(x, y);
          console.log();
          console.log(x, y);
          if (piece === PIECE.NOTHING) {
            console.log("black", {
              left: this.game.board.countLeft(x, y, PIECE.BLACK),
              right: this.game.board.countRight(x, y, PIECE.BLACK),
              up: this.game.board.countUp(x, y, PIECE.BLACK),
              down: this.game.board.countDown(x, y, PIECE.BLACK),
            });
            console.log("white", {
              left: this.game.board.countLeft(x, y, PIECE.WHITE),
              right: this.game.board.countRight(x, y, PIECE.WHITE),
              up: this.game.board.countUp(x, y, PIECE.WHITE),
              down: this.game.board.countDown(x, y, PIECE.WHITE),
            });
          } else {
            console.log(this.game.board.data(x, y));
            console.log({
              left: this.game.board.canMoveLeft(x, y),
              right: this.game.board.canMoveRight(x, y),
              up: this.game.board.canMoveUp(x, y),
              down: this.game.board.canMoveDown(x, y),
            });
          }
        }

        //this.stage.removeOnClick(ctx);
        //resolve(res);
      });
    });
  }

  async start() {
    while (true) {
      console.log(this.game);
      const turn = this.game.turn;
      const cur_mode = turn === PIECE.BLACK ? this.black_mode : this.white_mode;

      // await this.stageClick();

      const move = this.game.playRandomMove();
      console.log("from", [move.xi, move.yi], "to", [move.xf, move.yf]);

      // await this.stageClick();
      await new Promise((resolve) => setTimeout(resolve, 500));
      this.stage.erasePiece(move.xi, move.yi);
      if (turn === PIECE.BLACK) {
        this.stage.drawBlackPiece(move.xf, move.yf);
      } else {
        this.stage.drawWhitePiece(move.xf, move.yf);
      }
      if (move.takes) {
        console.log("removing", [move.xr, move.yr]);
        // await this.stageClick();
        await new Promise((resolve) => setTimeout(resolve, 1000));
        this.stage.erasePiece(move.xr, move.yr);
      }

      // switch (cur_mode) {
      //   case GAME_MODE.MANUAL:
      //     break;

      //   case GAME_MODE.RANDOM:
      //     break;

      //   default:
      //     throw new Error("Unimplemented!");
      // }
    }
  }
}
