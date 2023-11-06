("use strict");

import Component from "../../component.js";
import { showElement, hideElement } from "../../css_h.js";

export default class BoardSizeInput extends Component {
  static MIN_HEIGHT = 3;
  static MIN_WIDTH = 3;

  // the options need to be arrays of a width and a height
  static OPTIONS = [
    [5, 6],
    [6, 6],
    [50, 50],
  ];
  static CUSTOM_OPTION_VALUE = "custom";
  static CUSTOM_OPTION_TEXT = "Custom";

  static INVALID_WIDTH_ERROR_MESSAGES = {
    too_small: `Please input a width of at least ${BoardSizeInput.MIN_HEIGHT}`,
    required: "This field is required",
  };
  static INVALID_HEIGHT_ERROR_MESSAGES = {
    too_small: `Please input a height of at least ${BoardSizeInput.MIN_WIDTH}`,
    required: "This field is required",
  };

  // test for a validity of a string value
  // returns null if valid, otherwise an error string
  static customSizeInvalid = (val, min_val, err_messages) => {
    // expects val to be a integer if valid
    if (!val) {
      return err_messages.required;
    }
    if (parseInt(val) < min_val) {
      return err_messages.too_small;
    }
    return null;
  };

  static customWidthInvalid = (val) =>
    BoardSizeInput.customSizeInvalid(
      val,
      BoardSizeInput.MIN_WIDTH,
      BoardSizeInput.INVALID_WIDTH_ERROR_MESSAGES
    );
  static customHeightInvalid = (val) =>
    BoardSizeInput.customSizeInvalid(
      val,
      BoardSizeInput.MIN_HEIGHT,
      BoardSizeInput.INVALID_HEIGHT_ERROR_MESSAGES
    );

  static createElements() {
    /* 
      <div>
        <MainSelect />
        <div class="hidden">
          <CustomInput name="Custom width:" />
          <CustomInput name="Custom height:" />
        </div>
      </div>
    */

    // main select
    const { select, all: all_select } = BoardSizeInput.createMainSelect();

    const {
      all: all_width,
      input: width_input,
      err: width_err,
    } = BoardSizeInput.createCustomInput("Custom width:");
    const {
      all: all_height,
      input: height_input,
      err: height_err,
    } = BoardSizeInput.createCustomInput("Custom width:");

    const custom_field = document.createElement("div");
    custom_field.classList.add("hidden");
    custom_field.append(all_width, all_height);

    const target = document.createElement("div");
    target.append(all_select, custom_field);

    return {
      target: target,
      select: select,
      custom_field: custom_field,
      width: width_input,
      height: height_input,
      width_err: width_err,
      height_err: height_err,
    };
  }

  static createMainSelect() {
    /* 
    <label> Choose the board size:
      <select>
        [<DefaultOption />]
        <CustomOption />
      </select>
    </label>
    */

    const select = document.createElement("select");

    // default options
    BoardSizeInput.OPTIONS.forEach(([width, height], i) => {
      const opt = document.createElement("option");
      opt.value = i.toString();
      opt.innerHTML = `${width}x${height}`;
      select.appendChild(opt);
    });

    // custom option
    const custom_option = document.createElement("option");
    custom_option.value = BoardSizeInput.CUSTOM_OPTION_VALUE;
    custom_option.innerHTML = BoardSizeInput.CUSTOM_OPTION_TEXT;
    select.appendChild(custom_option);

    const label = document.createElement("label");
    label.append("Board size:", select);

    const target = document.createElement("p");
    target.appendChild(label);

    return {
      select: select,
      all: target,
    };
  }

  static createCustomInput(label_text) {
    /* 
      <p>
        <label> Custom width:
          <input type="number" />
        </label>
        <span class="hidden err-message"></span>
      </p>
    */
    const input = document.createElement("input");
    input.type = "number";
    const label = document.createElement("label");
    label.append(label_text, input);

    const err = document.createElement("span");
    err.classList.add("hidden", "err-message");

    const all = document.createElement("p");
    all.append(label, err);

    return {
      all: all,
      input: input,
      err: err,
    };
  }

  constructor() {
    const {target, ...els} = BoardSizeInput.createElements();
    super(target);

    this.err_update_callback = null;
    this.els = els;

    this.error_count = 0;
    this.option_i = 0;
    this._custom_size = undefined;

    this.els.select.addEventListener("change", (e) => {
      this.option_i = e.currentTarget.value;
    });
    this.els.width.addEventListener("change", (e) => {
      this.custom_size = [e.target.value, this.custom_size[1]];
    });
    this.els.height.addEventListener("change", (e) => {
      this.custom_size = [this.custom_size[0], e.target.value];
    });
  }

  set_error_update_callback(func) {
    this.err_update_callback = func;
  }

  static val(i) {
    // value is invalid if set to custom
    if (i === -1) {
      return undefined;
    }
    return BoardSizeInput.OPTIONS[i];
  }

  get option_i() {
    // returns index of current option, or -1 if custom
    return this._option_i;
  }

  set option_i(i_s) {
    // option will be equivalent to the option index
    const prev = this._option_i;
    this._option_i =
      i_s === BoardSizeInput.CUSTOM_OPTION_VALUE ? -1 : parseInt(i_s);

    if (prev === -1 && this._option_i !== -1) {
      // was custom before, now it's normal
      // val will be defined because the option index exists
      hideElement(this.els.custom_field);
      // custom field will get updated if chosen again
      this.error_count = 0;
    } else if (prev !== -1 && this._option_i === -1) {
      // was normal before, now it's custom
      const val = BoardSizeInput.val(prev);
      this.custom_size = [val[0].toString(), val[1].toString()];
      showElement(this.els.custom_field);
    }
  }

  getParsedSize() {
    if (this.error_count > 0) {
      throw Error("Tried to get size while in a invalid state");
    }

    // custom size will be valid if there are no errors
    const val = BoardSizeInput.val(this.option_i);
    return val
      ? val
      : [parseInt(this.custom_size[0]), parseInt(this.custom_size[1])];
  }

  get error_count() {
    return this._error_count;
  }

  set error_count(val) {
    this._error_count = val;
    if (this.err_update_callback !== null) {
      this.err_update_callback(val);
    }
  }

  get custom_size() {
    return this._custom_size;
  }

  // width / height need to be strings of numbers (or empty)
  set custom_size(size) {
    const [new_width, new_height] = size;
    const [old_width, old_height] = this._custom_size
      ? this._custom_size
      : [null, null];

    this._custom_size = size;

    if (new_width !== old_width) {
      this.els.width.value = new_width;

      const old_invalid =
        old_width !== null
          ? BoardSizeInput.customWidthInvalid(old_width) !== null
          : false;
      const new_invalid_message = BoardSizeInput.customWidthInvalid(new_width);
      const new_invalid = new_invalid_message !== null;

      if (new_invalid) {
        // show error message
        this.els.width_err.innerHTML = new_invalid_message;
        showElement(this.els.width_err);
      } else {
        // hide previously shown error message
        hideElement(this.els.width_err);
      }

      if (old_invalid && !new_invalid) {
        // new has no errors while old had
        this.error_count -= 1;
      } else if (!old_invalid && new_invalid) {
        // new has errors while old hadn't
        this.error_count += 1;
      }
    }

    if (new_height !== old_height) {
      this.els.height.value = new_height;

      const old_invalid =
        old_height !== null
          ? BoardSizeInput.customHeightInvalid(old_height) !== null
          : false;
      const new_invalid_message =
        BoardSizeInput.customHeightInvalid(new_height);
      const new_invalid = new_invalid_message !== null;

      if (new_invalid) {
        // show error message
        this.els.height_err.innerHTML = new_invalid_message;
        showElement(this.els.height_err);
      } else {
        // hide previously shown error message
        hideElement(this.els.height_err);
      }

      if (old_invalid && !new_invalid) {
        this.error_count -= 1;
      } else if (!old_invalid && new_invalid) {
        this.error_count += 1;
      }
    }
  }
}
