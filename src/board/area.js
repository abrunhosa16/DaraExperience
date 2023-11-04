import BoardGen from "./board_gen/board_gen.js";
import { BoardContainer } from "./container.js";

const dummy = () => {
  return document.createElement("div");
};

export default class BoardArea {
  constructor() {
    this.target = document.createElement("div");

    this._gen = [null, dummy()];
    this._container = [null, dummy()];

    this.target.append(this._gen[1], this._container[1]);

    this.gen = new BoardGen((configs) => {
      this.initializeContainer(configs);
    });
  }

  el() {
    return this.target;
  }

  initializeContainer(configs) {
    this.gen = null;
    this.container = new BoardContainer(configs);
    this.container.start();
  }

  set gen(obj) {
    // TODO: repeated code
    if (obj === null) {
      if (this._gen[0] !== null) {
        const d = dummy();
        this.target.replaceChild(d, this._gen[1]);
        this._gen = [null, d];
      }
    } else {
      this.target.replaceChild(obj.el(), this._gen[1]);
      this._gen = [obj, obj.el()];
    }
  }

  get gen() {
    return this._gen[0];
  }

  set container(obj) {
    if (obj === null) {
      if (this._container[0] !== null) {
        const d = dummy();
        this.target.replaceChild(d, this._container[1]);
        this._container = [null, d];
      }
    } else {
      this.target.replaceChild(obj.el(), this._container[1]);
      this._container = [obj, obj.el()];
    }
  }

  get container() {
    return this._container[0];
  }
}
