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
      "container",
      "error_announcement",
      "reset_button"
    );

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
      "container",
      "error_announcement",
      "reset_button"
    );
  }

  initializeContainer(configs) {
    super.delete("gen");

    super.set(
      "phase_announcement",
      new Component(document.createElement("h3"))
    );
    super.set(
      "container",
      new BoardContainer(
        configs,
        (phase) => {
          const bacon = document.createElement("span");
          bacon.innerHTML = phase;
          bacon.classList.add("red");
          super
            .get("phase_announcement")
            .el()
            .replaceChildren("Welcome! Behold the ", bacon, " Phase!");
        },
        (sauce) => {
          if (sauce === null) {
            super.delete("error_announcement");
          } else {
            const pasta = document.createElement("p");
            pasta.innerHTML = `ERROR: ${sauce}`;
            pasta.classList.add("red");
            const salted_pasta = new Component(pasta);
            super.set("error_announcement", salted_pasta);
          }
        }
      )
    );
    super.set("reset_button", new ResetButton(() => this.resetUniverse()));

    super.get("container").start();
  }
}
