import BoardGen from "./board_gen/board_gen.js";
import { BoardContainer } from "./container.js";
import ResetButton from "./reset_button.js";

const dummy = () => {
  return document.createElement("div");
};

const setComponent = (target, get_intr, set_intr) => {
  return (obj) => {
    const [old_obj, old_el] = get_intr();
    if (obj === null) {
      if (old_obj !== null) {
        const d = dummy();
        target.replaceChild(d, old_el);
        set_intr([null, d]);
      }
    } else {
      target.replaceChild(obj.el(), old_el);
      set_intr([obj, obj.el()]);
    }
  };
};

export default class BoardArea {
  constructor() {
    this.target = document.createElement("div");

    // I haven't tough of any not convoluted way to do this
    this._gen = [null, dummy()];
    this._container = [null, dummy()];
    this._reset_button = [null, dummy()];

    this.target.append(this._gen[1], this._container[1], this._reset_button[1]);

    this.resetUniverse();
  }

  el() {
    return this.target;
  }

  initializeContainer(configs) {
    this.gen = null;

    this.container = new BoardContainer(configs);
    this.reset_button = new ResetButton(() => this.resetUniverse());

    this.container.start();
  }

  resetUniverse() {
    this.gen = new BoardGen((configs) => {
      this.initializeContainer(configs);
    });
    this.container = null;
    this.reset_button = null;
  }

  set gen(obj) {
    setComponent(
      this.target,
      () => this._gen,
      (val) => {
        this._gen = val;
      }
    )(obj);
  }

  get gen() {
    return this._gen[0];
  }

  set container(obj) {
    setComponent(
      this.target,
      () => this._container,
      (val) => {
        this._container = val;
      }
    )(obj);
  }

  get container() {
    return this._container[0];
  }

  set reset_button(obj) {
    setComponent(
      this.target,
      () => this._reset_button,
      (val) => {
        this._reset_button = val;
      }
    )(obj);
  }

  get reset_button() {
    return this._reset_button[0];
  }
}
