import SizeInput from "../misc_components/size_input.js";
import MultiButtonSelection from "../misc_components/multi_button_selection.js";
import Component from "../component.js";
import Toggle from "../misc_components/toggle.js";
import DropChoose from "../misc_components/drop_choose.js";
import { COLOR, GAME_MODE, PIECE_TYPE } from "../in_game/in_game_area.js";

("use strict");

export default class OfflineGameGen extends Component {
  static createElements() {
    const title = document.createElement("h3");
    title.innerHTML = "Offline game configuration";

    const board_size_title = document.createElement("h4");
    board_size_title.innerHTML = "Board size";

    const size_input = new SizeInput();

    const mode_assignment_header = document.createElement("h4");
    mode_assignment_header.innerHTML = "Game mode";

    const white_mode = new MultiButtonSelection(
      "white_mode",
      "Player 1 (white):",
      [
        [GAME_MODE.MANUAL, "Human"],
        [GAME_MODE.RANDOM, "Play Randomly"],
        [GAME_MODE.MINIMAX, "AI (Minimax) (not implemented)"],
      ],
      GAME_MODE.MANUAL
    );

    const black_mode = new MultiButtonSelection(
      "black_mode",
      "Player 2 (black):",
      [
        [GAME_MODE.MANUAL, "Human"],
        [GAME_MODE.RANDOM, "Play Randomly"],
        [GAME_MODE.MINIMAX, "AI (Minimax) (not implemented)"],
      ],
      GAME_MODE.RANDOM
    );

    const starting_color = new MultiButtonSelection(
      "starting_color",
      "Starting player:",
      [
        [COLOR.WHITE, "Player 1 (white)"],
        [COLOR.BLACK, "Player 2 (black)"],
        [COLOR.RANDOM, "Random"],
      ],
      COLOR.RANDOM
    );

    const mode_assignment = document.createElement("div");
    mode_assignment.append(
      mode_assignment_header,
      white_mode.el(),
      black_mode.el(),
      starting_color.el()
    );

    const aesthetics_title = document.createElement("h4");
    aesthetics_title.innerHTML = "Aesthetics";

    const white_piece_type = new DropChoose(
      "Player 2 (black) piece type:",
      [
        [PIECE_TYPE.COIN, "Coin"],
        [PIECE_TYPE.LEAF, "Leaf"],
        [PIECE_TYPE.ROCK, "Rock"],
      ],
      0
    );
    const black_piece_type = new DropChoose(
      "Player 1 (white) piece type:",
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
      white_piece_type.el(),
      black_piece_type.el()
    );

    const other_title = document.createElement("h3");
    other_title.innerHTML = "Other";

    const skip_drop_phase = new Toggle(
      "Skip drop phase (places all pieces randomly): ",
      false
    );

    const other = document.createElement("div");
    other.append(other_title, skip_drop_phase.el());

    const submit_button = document.createElement("button");
    submit_button.innerHTML = "Start!";
    submit_button.classList.add("submit-button");

    const base = document.createElement("div");
    base.classList.add("game-gen");
    base.append(
      title,
      board_size_title,
      size_input.el(),
      mode_assignment,
      aesthetics,
      other,
      submit_button
    );

    return {
      base,
      size_input,
      white_mode,
      black_mode,
      starting_color,
      black_piece_type,
      white_piece_type,
      skip_drop_phase,
      submit: submit_button,
    };
  }

  constructor(submit_callback) {
    const {
      base,
      size_input,
      white_mode,
      black_mode,
      starting_color,
      black_piece_type,
      white_piece_type,
      skip_drop_phase,
      submit,
    } = OfflineGameGen.createElements();
    super(base);
    this.size_input = size_input;
    this.white_mode = white_mode;
    this.black_mode = black_mode;
    this.starting_color = starting_color;
    this.black_piece_type = black_piece_type;
    this.white_piece_type = white_piece_type;
    this.skip_drop_phase = skip_drop_phase;
    this.submit = submit;

    this.size_input.set_error_update_callback((err_count) => {
      this.error_count = err_count;
    });

    submit.addEventListener("click", (e) => {
      const [width, height] = this.size_input.getParsedSize();

      // options:
      //    width: width of the board in cells
      //    height: height of the board in cells
      //    black_mode: black player GAME_MODE
      //    white_mode: white player GAME_MODE
      //    black_piece_type: PIECE_TYPE
      //    white_piece_type: PIECE_TYPE
      //  If playing offline:
      //    starting_color: COLOR
      //    skip_drop_phase: bool (places pieces in drop phase randomly)

      submit_callback({
        mode: "offline",
        width: width,
        height: height,
        black_mode: this.black_mode.selected,
        white_mode: this.white_mode.selected,
        black_piece_type: this.black_piece_type.value,
        white_piece_type: this.white_piece_type.value,

        starting_color: this.starting_color.selected,
        skip_drop_phase: this.skip_drop_phase.toggled,
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
}
