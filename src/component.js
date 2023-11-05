export default class Component {
  constructor(el) {
    if (el === undefined) {
      this._el = document.createElement("div");
    } else {
      this._el = el;
    }
  }

  el() {
    return this._el;
  }
}
