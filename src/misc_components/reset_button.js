import Component from "../component.js";

export default class ResetButton extends Component {
  constructor(onClick) {
    super(document.createElement("button"))

    super.el().innerHTML = "Restart";
    super.el().classList.add("game-reset-button")
    super.el().addEventListener("click", onClick);
  }
}
