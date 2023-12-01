import Component from "../../component.js";
import { GAME_MODE } from "../area.js";
import { PIECE } from "../board.js";
import MovePhaseGame from "./game.js";

export default class MovePhaseArea extends Component {
  constructor(
    stage,
    drop_phase_game,
    black_mode,
    white_mode
  ) {
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

  async start() {
    return;

    while (true) {
      const turn = this.game.turn;
      const cur_mode = turn === PIECE.BLACK ? this.black_mode : this.white_mode;

      switch (cur_mode) {
        case GAME_MODE.MANUAL:
          break;

        case GAME_MODE.RANDOM:
          break;

        default:
          throw new Error("Unimplemented!");
      }
    }
  }
}
