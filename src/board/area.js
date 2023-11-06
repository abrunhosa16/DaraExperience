import Component from "../component.js";
import ComponentHolder from "../component_holder.js";
import BoardGen from "./board_gen/board_gen.js";
import { BoardContainer } from "./container.js";
import ResetButton from "./reset_button.js";

export default class BoardArea extends ComponentHolder {
  constructor() {
    super(
      "gen",
      "phase_announcement",
      "current_turn",
      "container",
      "error_announcement",
      "win_announcement",
      "reset_button"
    );

    super.el().classList.add("game-area");

    this.resetUniverse();
  }

  resetUniverse() {
    super.set(
      "gen",
      new BoardGen((configs) => {
        this.initializeContainer(configs);
      })
    );
    super.delete(
      "phase_announcement",
      "current_turn",
      "container",
      "error_announcement",
      "win_announcement",
      "reset_button"
    );
  }

  initializeContainer(configs) {
    super.delete("gen");

    super.set(
      "phase_announcement",
      new Component(document.createElement("h3"))
    );
    super.set("current_turn", new Component(document.createElement("p")));
    super.set(
      "container",
      new BoardContainer(configs, {
        phaseChange: (phase) => {
          const bacon = document.createElement("span");
          bacon.innerHTML = phase;
          bacon.classList.add("red");
          super
            .get("phase_announcement")
            .el()
            .replaceChildren("Welcome! Behold the ", bacon, " Phase!");
        },
        invalidMessage: (sauce) => {
          if (sauce === null) {
            super.delete("error_announcement");
          } else {
            const pasta = document.createElement("p");
            pasta.innerHTML = `ERROR: ${sauce}`;
            pasta.classList.add("red");
            const salted_pasta = new Component(pasta);
            super.set("error_announcement", salted_pasta);
          }
        },
        turn: (turn, remove_phase) => {
          const spin = document.createElement("span");
          spin.innerHTML = remove_phase ? `${turn} (Removing enemy piece...)`: turn;
          spin.classList.add("red");

          super
            .get("current_turn")
            .el()
            .replaceChildren("Current turn: ", spin);
        },
        won: (black) => {
          console.log("won!");
          super.get("container").removeAllEventListeners();
          const angel = document.createElement("p");
          angel.innerHTML = `Congratulations to ${black ? "Black" : "White"}, you won!`;
          super.set("win_announcement", new Component(angel));
        }
      })
    );
    super.set("reset_button", new ResetButton(() => this.resetUniverse()));
  }
}
