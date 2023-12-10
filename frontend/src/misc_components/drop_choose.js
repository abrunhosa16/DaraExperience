import Component from "../component.js";

export default class DropChoose extends Component {
  static createElements(label_text, options) {
    const select = document.createElement("select");

    options.forEach(([val, content]) => {
      const opt = document.createElement("option");
      opt.value = val;
      opt.innerHTML = content;
      select.appendChild(opt);
    });

    const label = document.createElement("label");
    label.append(label_text, select);

    const target = document.createElement("p");
    target.appendChild(label);

    return {
      target: target,
      select: select,
    };
  }

  constructor(label_text, options, default_index) {
    const { target, select } = DropChoose.createElements(
      label_text,
      options
    );
    super(target);
    this.select = select;

    this.value = default_index ? options[default_index][0] : options[0][0];

    select.addEventListener("change", (e) => {
      this.value = e.target.value;
    });
  }

  get value() {
    return this._value;
  }

  set value(val) {
    this.select.value = val;
    this._value = val;
  }
}
