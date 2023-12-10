import Component from "../component.js";

export default class Toggle extends Component {
  static createElements(message) {
    const input = document.createElement("input");
    input.type = "checkbox";

    const label = document.createElement("label");
    label.append(message, input);

    const target = document.createElement("p");
    target.appendChild(label);

    return {
      target: target,
      input: input,
    };
  }

  constructor(message, initially_toggled) {
    const { target, input } = Toggle.createElements(message);
    super(target);

    this.input = input;

    this.toggled = initially_toggled;

    input.addEventListener("change", (e) => {
      this.toggled = e.target.checked;
    });
  }

  get toggled() {
    return this._toggled;
  }

  set toggled(val) {
    this.input.checked = val;
    this._toggled = val;
  }
}
