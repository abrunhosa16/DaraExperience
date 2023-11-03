("use strict");

const markAsSelected = (element) => {
  element.classList.add("sel-button");
  element.disabled = true;
};

const markAsUnselected = (element) => {
  element.classList.remove("sel-button");
  element.disabled = false;
};

export default class MultiButtonSelection {
  static createElements(id, label_text, button_id_texts) {
    /* 
    <p>
        White pieces:
        [<SelectionButton />]
    </p>
    */

    const target = document.createElement("p");
    target.id = id;
    target.append(label_text);

    const buttons = {};
    Object.entries(button_id_texts).forEach(([b_id, txt]) => {
      const b = document.createElement("button");
      b.id = `${id}-${b_id}`;
      b.innerHTML = txt;
      target.appendChild(b);
      buttons[b_id] = b;
    });

    return { target: target, buttons: buttons };
  }

  // button_id_texts: { [id]: text }
  constructor(id, label, button_id_texts, initial_button_id) {
    const { target, buttons } = MultiButtonSelection.createElements(
      id,
      label,
      button_id_texts
    );
    this.target = target;
    this.buttons = buttons;
    this.selected = initial_button_id;

    Object.entries(this.buttons).forEach(([id, el]) => {
      el.addEventListener("click", (e) => {
        this.selected = id;
      });
    });
  }

  set selected(val) {
    if (!this.buttons.hasOwnProperty(val)) {
      throw Error(
        `Trying to select an unknown value "${val}" in MultiButtonSelection`
      );
    }
    if (this._selected) {
      markAsUnselected(this.buttons[this._selected]);
    }
    markAsSelected(this.buttons[val]);
    this._selected = val;
  }

  get selected() {
    return this._selected;
  }

  el() {
    return this.target;
  }
}
