import Component from "../component.js";
import BoardGen from "./board_gen/board_gen.js";

export default class BoardArea extends Component {
  constructor(cred_mgr, sign_up_modal) {
    const board_gen = new BoardGen(cred_mgr, (configs) => {
      // this.initializeContainer(configs);
    }, sign_up_modal);

    const base = document.createElement("div");
    base.classList.add("game-area");
    base.append(board_gen.el());

    super(
      base
    );
  }
}
