("use strict");

import { showElement, hideElement } from "../css_h.js";

export default class BoardSizeInput {
  static MIN_HEIGHT = 3;
  static MIN_WIDTH = 3;

  // the options need to be arrays of a width and a height
  static DEFAULT_OPTIONS = [
    [5, 6],
    [6, 6],
    [50, 50],
  ];
  static CUSTOM_OPTION_VALUE = "custom";
  static CUSTOM_OPTION_TEXT = "Custom";
  static OPTION_VAL_SEPARATOR = "_";

  static INVALID_WIDTH_ERROR_MESSAGES = {
    too_small: `Please input a width of at least ${BoardSizeInput.MIN_HEIGHT_WIDTH}`,
    required: "This field is required",
  };
  static INVALID_HEIGHT_ERROR_MESSAGES = {
    too_small: `Please input a height of at least ${BoardSizeInput.MIN_HEIGHT_WIDTH}`,
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

  static parseSizeSelection = (val) => {
    const ind = val.indexOf(BoardSizeInput.OPTION_VAL_SEPARATOR);
    const width = parseInt(val.substr(0, ind));
    const height = parseInt(val.substr(ind + 1));
    return [width, height];
  };

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
    BoardSizeInput.DEFAULT_OPTIONS.forEach(([width, height]) => {
      const opt = document.createElement("option");
      opt.value = `${width}_${height}`;
      opt.innerHTML = `${width}x${height}`;
      select.appendChild(opt);
    });

    // custom option
    const custom_option = document.createElement("option");
    custom_option.value = BoardSizeInput.CUSTOM_OPTION_VALUE;
    custom_option.innerHTML = BoardSizeInput.CUSTOM_OPTION_TEXT;
    select.appendChild(custom_option);

    const label = document.createElement("label");
    label.append("Choose the board size:", select);

    return {
      select: select,
      all: label,
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

  constructor(err_update_callback) {
    this.err_update_callback = err_update_callback;
    this.els = BoardSizeInput.createElements();

    this.error_count = 0;
    this.custom_size = ["", ""];
    const initial_opt = BoardSizeInput.DEFAULT_OPTIONS[0];
    this.val = `${initial_opt[0]}${BoardSizeInput.OPTION_VAL_SEPARATOR}${initial_opt[1]}`;

    this.els.select.addEventListener("change", (e) => {
      this.val = e.currentTarget.value;
    });
    this.els.width.addEventListener("change", (e) => {
      this.custom_size = [e.target.value, this.custom_size[1]];
    });
    this.els.height.addEventListener("change", (e) => {
      this.custom_size = [this.custom_size[0], e.target.value];
    });
  }

  getParsedSize() {
    console.log(this);
    if (this.error_count > 0) {
      throw Error("Tried to get size while in a invalid state");
    }

    const [width, height] =
      this.val === BoardSizeInput.CUSTOM_OPTION_VALUE
        ? this.custom_size
        : BoardSizeInput.parseSizeSelection(this.val);
    return [parseInt(width), parseInt(height)];
  }

  el() {
    return this.els.target;
  }

  get val() {
    return this._val;
  }

  set val(val) {
    if (val === BoardSizeInput.CUSTOM_OPTION_VALUE) {
      this.custom_size = BoardSizeInput.parseSizeSelection(this._val);
      showElement(this.els.custom_field);
    } else {
      hideElement(this.els.custom_field);
    }

    this._val = val;
  }

  get error_count() {
    return this._error_count;
  }

  set error_count(val) {
    this._error_count = val;
    this.err_update_callback(val);
  }

  get custom_size() {
    return this._custom_size;
  }

  set custom_size(val) {
    const [new_width, new_height] = val;
    const [old_width, old_height] = this._custom_size ? this._custom_size : ["5", "6"];

    this._custom_size = val;

    console.log(new_width, old_width, new_height, old_height);
    if (new_width !== old_width) {
      this.els.width.value = new_width;

      const old_invalid = BoardSizeInput.customWidthInvalid(old_width) !== null;
      const new_invalid_message = BoardSizeInput.customWidthInvalid(new_width);
      const new_invalid = new_invalid_message !== null;

      console.log(old_invalid, new_invalid_message, new_invalid);

      if (new_invalid) {
        this.els.width_err.innerHTML = new_invalid_message;
        hideElement(this.els.width_err);
      } else {
        showElement(this.els.width_err);
      }

      if (old_invalid && !new_invalid) {
        this.error_count -= 1;
      } else if (!old_invalid && new_invalid) {
        this.error_count += 1;
      }
    }

    if (new_height !== old_height) {
      this.els.height.value = new_height;

      const old_invalid =
        BoardSizeInput.customHeightInvalid(old_height) !== null;
      const new_invalid_message = BoardSizeInput.customHeightInvalid(new_height);
      const new_invalid = new_invalid_message !== null;

      if (new_invalid) {
        this.els.height_err.innerHTML = new_invalid_message;
        hideElement(this.els.height_err);
      } else {
        showElement(this.els.height_err);
      }

      if (old_invalid && !new_invalid) {
        this.error_count -= 1;
      } else if (!old_invalid && new_invalid) {
        this.error_count += 1;
      }
    }
  }
}
