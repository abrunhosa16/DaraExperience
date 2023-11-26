import Component from "../component.js";
import DropChoose from "../misc_components/drop_choose.js";
import BoardSizeInput from "../misc_components/size_input.js";

("use strict");

export const BOARD_GEN_SIGN_BUTTON_ID = "board-gen-sign-up-button";

export default class OnlineGameGen extends Component {
  static signUpButton(sign_up_modal) {
    const sign_up_button = document.createElement("button");
    sign_up_button.innerHTML = "Sign up";
    sign_up_button.id = BOARD_GEN_SIGN_BUTTON_ID;
    sign_up_button.addEventListener("click", () => {
      sign_up_modal.open();
    });

    return sign_up_button;
  }

  static createElements(username) {
    const sign_up_text = document.createElement("p");
    const bold_user = document.createElement("i");
    bold_user.innerHTML = username;
    sign_up_text.append("<Signed in as ", bold_user, ">");

    const title = document.createElement("h3");
    title.innerHTML = "Match search options";

    const board_size_title = document.createElement("h4");
    board_size_title.innerHTML = "Board size";

    const size_input = new BoardSizeInput();

    const aesthetics_title = document.createElement("h4");
    aesthetics_title.innerHTML = "Local aesthetics";

    const player1_piece_type = new DropChoose("Your piece type:", [
      ["coin", "Coin"],
      ["leaf", "Leaf"],
      ["rock", "Rock"],
    ]);
    const player2_piece_type = new DropChoose("Enemy piece type:", [
      ["coin", "Coin"],
      ["leaf", "Leaf"],
      ["rock", "Rock"],
    ]);

    const submit_button = document.createElement("button");
    submit_button.innerHTML = "Search for a match";
    submit_button.classList.add("submit-button");

    const base = document.createElement("div");
    base.classList.add("board-config");
    base.append(
      sign_up_text,
      title,
      board_size_title,
      size_input.el(),
      aesthetics_title,
      player1_piece_type.el(),
      player2_piece_type.el(),
      submit_button
    );

    return {
      base: base,
      size_input: size_input,
      player1_piece_type: player1_piece_type,
      player2_piece_type: player2_piece_type,
      submit: submit_button,
    };
  }

  signedIn(username) {
    super.el().innerHTML = "";
    const { base, size_input, player1_piece_type, player2_piece_type, submit } =
      OnlineGameGen.createElements(username);
    super.el().appendChild(base);
  }

  signedOut(sign_up_modal) {
    const sign_up_text = document.createElement("p");
    sign_up_text.innerHTML = "Sign up to continue";

    super.el().innerHTML = "";
    super.el().appendChild(sign_up_text);
    super.el().appendChild(OnlineGameGen.signUpButton(sign_up_modal));
  }

  constructor(cred_mgr, submit_callback, sign_up_modal) {
    super();

    if (cred_mgr.signedIn()) {
      this.signedIn(cred_mgr.getUsername());
    } else {
      this.signedOut(sign_up_modal);
    }

    cred_mgr.addSignUpCallback(() => {
      this.signedIn(cred_mgr.getUsername());
    });
    cred_mgr.addSignOutCallback(() => {
      this.signedOut(sign_up_modal);
    });
  }
}
