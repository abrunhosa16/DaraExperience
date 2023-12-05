import Component from "../component.js";
import { PIECE_TYPE } from "../in_game/area.js";
import DropChoose from "../misc_components/drop_choose.js";
import SizeInput from "../misc_components/size_input.js";

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

    const size_input = new SizeInput();

    const aesthetics_title = document.createElement("h4");
    aesthetics_title.innerHTML = "Local aesthetics";

    const black_piece_type = new DropChoose("Your piece type:", [
      [PIECE_TYPE.COIN, "Coin"],
      [PIECE_TYPE.LEAF, "Leaf"],
      [PIECE_TYPE.ROCK, "Rock"],
    ]);
    const white_piece_type = new DropChoose("Opponent piece type:", [
      [PIECE_TYPE.COIN, "Coin"],
      [PIECE_TYPE.LEAF, "Leaf"],
      [PIECE_TYPE.ROCK, "Rock"],
    ], 1);

    const aesthetics = document.createElement("div");
    aesthetics.append(
      aesthetics_title,
      black_piece_type.el(),
      white_piece_type.el()
    );

    const submit_button = document.createElement("button");
    submit_button.innerHTML = "Search for a match";
    submit_button.classList.add("submit-button");

    const base = document.createElement("div");
    base.classList.add("game-gen");
    base.append(
      sign_up_text,
      title,
      board_size_title,
      size_input.el(),
      aesthetics,
      submit_button
    );

    return {
      base,
      size_input,
      black_piece_type,
      white_piece_type,
      submit: submit_button,
    };
  }

  signedIn(username, submit_callback) {
    super.el().innerHTML = "";
    const { base, size_input, black_piece_type, white_piece_type, submit } =
      OnlineGameGen.createElements(username);
    super.el().appendChild(base);

    this.size_input = size_input;
    this.black_piece_type = black_piece_type;
    this.white_piece_type = white_piece_type;
    this.submit = submit;

    this.error_count = 0;

    this.size_input.set_error_update_callback((err_count) => {
      this.error_count = err_count;
    });

    submit.addEventListener("click", (e) => {
      const [width, height] = this.size_input.getParsedSize();

      // options:
      //    width: width of the board in cells
      //    height: height of the board in cells
      //    black_piece_type: PIECE_TYPE
      //    white_piece_type: PIECE_TYPE
      submit_callback({
        mode: "online",
        width: width,
        height: height,
        black_piece_type: this.black_piece_type.value,
        white_piece_type: this.white_piece_type.value,
      });
    });
  }

  get error_count() {
    return this._error_count;
  }

  // currently only works for one callback element
  set error_count(val) {
    this._error_count = val;
    // disable submit button if there are errors
    this.submit.disabled = val > 0;
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

    this.size_input = null;
    this.black_piece_type = null;
    this.white_piece_type = null;
    this.submit = null;

    this._error_count = 0;

    if (cred_mgr.signedIn()) {
      this.signedIn(cred_mgr.getUsername(), submit_callback);
    } else {
      this.signedOut(sign_up_modal);
    }

    cred_mgr.addSignUpCallback(() => {
      this.signedIn(cred_mgr.getUsername(), submit_callback);
    });
    cred_mgr.addSignOutCallback(() => {
      this.signedOut(sign_up_modal);
    });
  }
}
