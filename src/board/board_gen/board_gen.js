import BoardSizeInput from "./size_input.js";
import MultiButtonSelection from "./multi_button_selection.js";
import Component from "../../component.js";
import BoardToggle from "./toggle.js";
import DropChoose from "./drop_choose.js";

("use strict");

/* 
<div class="form">
  <BoardSizeInput />

  <div>
    <p>White starting piece count (todo): <input type="text" id="gen-count-white"/></p>
    <p>Black starting piece count (todo): <input type="text" id="gen-count-black"/></p>
  </div>

  <h3>Player assignment</h3>
  <MultiButtonSelection id="player1" label="White pieces:">
    ("human", "Human")
    ("random", "Play randomly")
    ("ai", "AI (Minimax)")
  </MultiButtonSelection>

  <MultiButtonSelection id="player2" label="Black pieces:">
    ("human", "Human")
    ("random", "Play randomly")
    ("ai", "AI (Minimax)")
  </MultiButtonSelection>

  <MultiButtonSelection id="starting_player" label="Starting pieces:">
    ("white", "White")
    ("black", "Black")
    ("random", "Random")
  </MultiButtonSelection>

  <button>Let's do this</button>
</div>
*/

export default class BoardGen extends Component {
  static createElements() {
    const title = document.createElement("h2");
    title.innerHTML = "Start playing";

    const board_size_title = document.createElement("h3");
    board_size_title.innerHTML = "Board size";

    const size_input = new BoardSizeInput();

    const player_assignment_header = document.createElement("h3");
    player_assignment_header.innerHTML = "Player assignment";

    // TODO: piece count

    const player1 = new MultiButtonSelection(
      "player1",
      "White pieces:",
      {
        human: "Human",
        random: "Play Randomly",
        ai: "AI (Minimax)",
      },
      "human"
    );

    const player2 = new MultiButtonSelection(
      "player2",
      "Black pieces:",
      {
        human: "Human",
        random: "Play Randomly",
        ai: "AI (Minimax)",
      },
      "human"
    );

    const player_assignment = document.createElement("div");
    player_assignment.append(player_assignment_header, player1.el(), player2.el());

    const starting_player = new MultiButtonSelection(
      "starting_player",
      "Starting pieces:",
      {
        white: "White",
        black: "Black",
        random: "Random",
      },
      "random"
    );

    const aesthetics_title = document.createElement("h3");
    aesthetics_title.innerHTML = "Aesthetics";

    const black_piece_type = new DropChoose("Select black piece type:", [
      ["coin", "Coin"],
      ["leaf", "Leaf"],
      ["rock", "Rock"],
    ]);
    const white_piece_type = new DropChoose("Select white piece type:", [
      ["coin", "Coin"],
      ["leaf", "Leaf"],
      ["rock", "Rock"],
    ]);

    const skip_drop_phase = new BoardToggle(
      "Skip drop phase (places all pieces randomly): ",
      false
    );
    
    const other_title = document.createElement("h3");
    other_title.innerHTML = "Other";

    const submit_button = document.createElement("button");
    submit_button.innerHTML = "Start!";
    submit_button.classList.add("submit-button");

    const target = document.createElement("div");
    target.classList.add("board-config");
    target.append(
      title,
      board_size_title,
      size_input.el(),
      player_assignment,
      starting_player.el(),
      aesthetics_title,
      black_piece_type.el(),
      white_piece_type.el(),
      other_title,
      skip_drop_phase.el(),
      submit_button
    );

    return {
      target: target,
      size_input: size_input,
      player1: player1,
      player2: player2,
      starting_player: starting_player,
      black_piece_type: black_piece_type,
      white_piece_type: white_piece_type,
      skip_drop_phase: skip_drop_phase,
      submit: submit_button,
    };
  }

  constructor(submit_callback) {
    const {
      target,
      submit,
      size_input,
      player1,
      player2,
      starting_player,
      skip_drop_phase,
      black_piece_type,
      white_piece_type,
    } = BoardGen.createElements();
    super(target);
    this.size_input = size_input;
    this.player1 = player1;
    this.player2 = player2;
    this.starting_player = starting_player;
    this.black_piece_type = black_piece_type;
    this.white_piece_type = white_piece_type;
    this.skip_drop_phase = skip_drop_phase;
    this.submit = submit;

    this.size_input.set_error_update_callback((err_count) => {
      this.error_count = err_count;
    });

    submit.addEventListener("click", (e) => {
      const [width, height] = this.size_input.getParsedSize();

      submit_callback({
        width: width,
        height: height,
        white_player: this.player1.selected,
        black_player: this.player2.selected,
        starting_player: this.starting_player.selected,
        black_piece_type: this.black_piece_type.value,
        white_piece_type: this.white_piece_type.value,
        skip_drop_phase: this.skip_drop_phase.toggled,
        white_count: 12,
        black_count: 12,
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
