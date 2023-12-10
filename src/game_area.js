import Component from "./component.js";
import GameGen from "./game_options/gen.js";
import InGameArea from "./in_game/area.js";

export default class GameArea extends Component {
  constructor(cred_mgr, sign_up_modal) {
    const base = document.createElement("div");
    base.classList.add("game-area");

    super(base);

    this.cred_mgr = cred_mgr;
    this.sign_up_modal = sign_up_modal;

    this.setToGameGeneration();
  }

  setToGameGeneration() {
    const gen = new GameGen(
      this.cred_mgr,
      (game_options) => {
        this.startGame(game_options)
      },
      this.sign_up_modal
    );

    const base = super.el();
    base.innerHTML = "";
    base.appendChild(gen.el());
  }

  startGame(options) {
    const game_area = new InGameArea(options);

    const base = super.el();
    base.innerHTML = "";
    base.appendChild(game_area.el());
  }
}
