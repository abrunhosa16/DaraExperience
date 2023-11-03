import BoardSizeInput from "./size_input.js";
import MultiButtonSelection from "./multi_button_selection.js";

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

export default class BoardGen {
  static createElements() {
    const size_input = new BoardSizeInput((err_count) => {
      this.error_count = err_count;
    });

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

    const submit_button = document.createElement("button");
    submit_button.innerHTML = "Let's do this";

    const target = document.createElement("div");
    target.classList.add("form");
    target.append(
      size_input.el(),
      player_assignment_header,
      player1.el(),
      player2.el(),
      starting_player.el(),
      submit_button
    );

    return {
      target: target,
      size_input: size_input,
      player1: player1,
      player2: player2,
      starting_player: starting_player,
      submit: submit_button,
    };
  }

  constructor(submit_callback) {
    const { target, submit, size_input, player1, player2, starting_player } =
      BoardGen.createElements();
    this.target = target;
    this.size_input = size_input;
    this.player1 = player1;
    this.player2 = player2;
    this.starting_player = starting_player;
    this.submit = submit;

    submit.addEventListener("click", (e) => {
      const [width, height] = this.size_input.getParsedSize();

      submit_callback({
        width: width,
        height: height,
        white_player: this.player1.selected,
        black_player: this.player2.selected,
        starting_player: this.starting_player.selected,
        white_count: 12,
        black_count: 12,
      });
    });
  }

  el() {
    return this.target;
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
