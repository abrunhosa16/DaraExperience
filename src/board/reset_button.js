import Component from "../component.js";

export default class ResetButton extends Component {
  constructor(onClick) {
    super(document.createElement("button"))

    super.el().innerHTML = "Restart";
    super.el().addEventListener("click", onClick);
  }
}
