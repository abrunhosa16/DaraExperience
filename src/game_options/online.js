import Component from "../component.js";
import { hideElement, showElement } from "../css_h.js";
import { PIECE_TYPE } from "../in_game/area.js";
import OnlineGameManager from "../in_game/online_game_manager.js";
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
    const white_piece_type = new DropChoose(
      "Opponent piece type:",
      [
        [PIECE_TYPE.COIN, "Coin"],
        [PIECE_TYPE.LEAF, "Leaf"],
        [PIECE_TYPE.ROCK, "Rock"],
      ],
      1
    );

    const aesthetics = document.createElement("div");
    aesthetics.append(
      aesthetics_title,
      black_piece_type.el(),
      white_piece_type.el()
    );

    const search_message = document.createElement("p");
    search_message.innerHTML = "Searching...";
    search_message.classList.add("hidden");

    const search_button = document.createElement("button");
    search_button.innerHTML = "Search for a match";
    search_button.classList.add("submit-button");

    const abort_button = document.createElement("button");
    abort_button.innerText = "Cancel";
    abort_button.classList.add("submit-button", "hidden");

    const base = document.createElement("div");
    base.classList.add("game-gen");
    base.append(
      sign_up_text,
      title,
      board_size_title,
      size_input.el(),
      aesthetics,
      search_message,
      search_button,
      abort_button
    );

    return {
      base,
      size_input,
      black_piece_type,
      white_piece_type,
      search_message,
      search_button,
      abort_button,
    };
  }

  signedIn(api, cred_mgr, submit_callback) {
    super.el().innerHTML = "";
    const {
      base,
      size_input,
      black_piece_type,
      white_piece_type,
      search_message,
      search_button,
      abort_button,
    } = OnlineGameGen.createElements(cred_mgr.getUsername());
    super.el().appendChild(base);

    this.size_input = size_input;
    this.black_piece_type = black_piece_type;
    this.white_piece_type = white_piece_type;
    this.search_button = search_button;
    this.abort_button = abort_button;

    this.error_count = 0;

    this.game_manager = new OnlineGameManager(api, cred_mgr);

    size_input.set_error_update_callback((err_count) => {
      this.error_count = err_count;
    });

    search_button.addEventListener("click", (e) => {
      const [width, height] = this.size_input.getParsedSize();
      this.search_button.disabled = true;

      this.game_manager
        .searchGame(width, height)
        .then(() => {
          hideElement(search_button);
          showElement(search_message);
          showElement(abort_button);
        })
        .catch(() => {
          if (this.error_count === 0) {
            search_button.disabled = false;
          }
        });

      // options:
      //    width: width of the board in cells
      //    height: height of the board in cells
      //    black_piece_type: PIECE_TYPE
      //    white_piece_type: PIECE_TYPE
      // submit_callback({
      //   mode: "online",
      //   width: width,
      //   height: height,
      //   black_piece_type: this.black_piece_type.value,
      //   white_piece_type: this.white_piece_type.value,
      // });
    });

    abort_button.addEventListener("click", (e) => {
      abort_button.disabled = true;
      this.game_manager
        .abortSearch()
        .then(() => {
          abort_button.disabled = false;
          if (this.error_count === 0) {
            search_button.disabled = false;
          }
          hideElement(search_message);
          hideElement(abort_button);
          showElement(search_button);
        })
        .catch(() => {
          abort_button.disabled = false;
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
    this.search_button.disabled = val > 0;
  }

  signedOut(sign_up_modal) {
    const sign_up_text = document.createElement("p");
    sign_up_text.innerHTML = "Sign up to continue";

    super.el().innerHTML = "";
    super.el().appendChild(sign_up_text);
    super.el().appendChild(OnlineGameGen.signUpButton(sign_up_modal));
  }

  constructor(api, cred_mgr, submit_callback, sign_up_modal) {
    super();

    this.size_input = null;
    this.black_piece_type = null;
    this.white_piece_type = null;
    this.search_button = null;
    this.abort_button = null;

    this._error_count = 0;

    if (cred_mgr.signedIn()) {
      this.signedIn(api, cred_mgr, submit_callback);
    } else {
      this.signedOut(sign_up_modal);
    }

    cred_mgr.addSignUpCallback(() => {
      this.signedIn(api, cred_mgr, submit_callback);
    });
    cred_mgr.addSignOutCallback(() => {
      this.signedOut(sign_up_modal);
    });
  }
}
