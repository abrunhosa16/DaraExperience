import Component from "../component.js";

export default class ResetButton extends Component {
  constructor(onClick) {
    super(document.createElement("button"))

    super.el().innerHTML = "I surrender";
    super.el().addEventListener("click", onClick);
  }
}
