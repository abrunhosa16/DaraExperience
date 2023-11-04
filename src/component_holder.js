import Component from "./component.js";

const dummy = () => {
  return document.createElement("div");
};

// List of different components that tend to change
export default class ComponentHolder extends Component {
  constructor(...component_names) {
    super();

    this.components = {};

    const children = [];
    Array.from(component_names).forEach((name) => {
      const d = dummy();
      this.components[name] = [null, d];
      children.push(d);
    });

    super.el().append(...children);
  }

  get(name) {
    return this.components[name][0];
  }

  set(name, obj) {
    const [old_obj, old_el] = this.components[name];
    if (obj === null) {
      if (old_obj !== null) {
        const d = dummy();
        super.el().replaceChild(d, old_el);
        this.components[name] = [null, d];
      }
    } else {
      super.el().replaceChild(obj.el(), old_el);
      this.components[name] = [obj, obj.el()];
    }
  }

  delete(...names) {
    Array.from(names).forEach((name) => {
      this.set(name, null);
    });
  }
}
