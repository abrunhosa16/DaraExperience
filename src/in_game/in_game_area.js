import Component from "../component.js";
import { PIECE } from "./board.js";
import DropPhaseGame from "./drop_phase_game.js";
import gameStage from "./stage.js";

const GAME_MODE = {
  MANUAL: 0,
  RANDOM: 1,
  MINIMAX: 2,
  ONLINE: 3,
};

export default class InGameArea extends Component {
  constructor(options) {
    console.log(options);

    const base = document.createElement("div");

    const title = document.createElement("h3");
    title.innerHTML = "Hello I am the game";
    base.appendChild(title);

    const stage = new gameStage(options);
    base.appendChild(stage.el());

    super(base);

    this.stage = stage;
    this.game = new DropPhaseGame(options.width, options.height, PIECE.BLACK);

    this.black_mode = GAME_MODE.MANUAL;
    this.white_mode = GAME_MODE.RANDOM;

    this.stage.load("coin", "coin").then(() => {
      this.start();
    });
  }

  async stageClick() {
    return new Promise((resolve, reject) => {
      const ctx = this.stage.addOnClick((res) => {
        if (res !== null) {
          this.stage.removeOnClick(ctx);
          resolve(res);
        }
      });
    });
  }

  async start() {
    while (true) {
      const turn = this.game.turn;
      const mode = turn === PIECE.BLACK ? this.black_mode : this.white_mode;

      let x, y;
      let phase_ended;
      switch (mode) {
        case GAME_MODE.MANUAL:
          [x, y] = await this.stageClick();

          try {
            phase_ended = this.game.play(x, y);
          } catch (err) {
            console.log(err);
            continue;
          }
          break;
        case GAME_MODE.RANDOM:
          const move_list = this.game.getMoveList();
          const i = Math.floor(Math.random() * move_list.length);
          [x, y] = move_list[i];

          phase_ended = this.game.play(x, y);
          break;

        default:
          throw new Error("Unimplemented!");
      }

      if (turn === PIECE.BLACK) {
        this.stage.drawBlack(x, y);
      } else {
        this.stage.drawWhite(x, y);
      }

      if (phase_ended) {
        break;
      }
    }
  }
}
