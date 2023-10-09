"use strict";

// min board height and width
const MIN_HEIGHT_WIDTH = 3;

const INVALID_WIDTH_ERROR_MESSAGES = {
  too_small: `Please input a width of at least ${MIN_HEIGHT_WIDTH}`,
  required: "This field is required",
};
const INVALID_HEIGHT_ERROR_MESSAGES = {
  too_small: `Please input a height of at least ${MIN_HEIGHT_WIDTH}`,
  required: "This field is required",
};

const ELEMENT_IDS = {
  main: "board",
  config: {
    size: {
      main: "b-size-sel",
      custom: {
        main: "b-size-sel-custom",
        width: "b-size-sel-w",
        height: "b-size-sel-h",
        width_err: "b-size-sel-w-err",
        height_err: "b-size-sel-h-err",
      },
    },
    gen: "b-gen-button",
  },
};

function getSizeSelectOnChange(custom_select_el) {
  return (new_val) => {
    if (new_val === "custom") {
      custom_select_el.classList.remove("hidden");
    } else {
      custom_select_el.classList.add("hidden");
    }
  };
}

function isCustomSizeValid(val) {
  // val expected to be null or Int
  // returns true if valid
  return !(val === null || parseInt(val) < MIN_HEIGHT_WIDTH);
}

function getCustomSizeErrorMessage(val, err_messages) {
  // val expected to be null or Int
  if (val === null) {
    return err_messages.required;
  }
  if (parseInt(val) < MIN_HEIGHT_WIDTH) {
    return err_messages.too_small;
  }
  return null;
}

function getCustomSizeInpOnChange(error_el, err_messages) {
  return (new_val) => {
    let err = getCustomSizeErrorMessage(new_val, err_messages);
    if (err !== null) {
      error_el.innerHTML = err;
      error_el.classList.remove("hidden");
    } else {
      error_el.classList.add("hidden");
    }
  };
}

function validateBoardCreation() {
  const size = document.getElementById(ELEMENT_IDS.config.size.main);
  if (size.value === "custom") {
    if (
      !isCustomSizeValid(
        document.getElementById(ELEMENT_IDS.config.size.custom.width).value
      ) ||
      !isCustomSizeValid(
        document.getElementById(ELEMENT_IDS.config.size.custom.height).value
      )
    ) {
      return false;
    }
  }
  return true;
}

function updateGenButton() {
  const button = document.getElementById(ELEMENT_IDS.config.gen);
  button.disabled = !validateBoardCreation();
}

function initialize_board_size_selection() {
  const ids = ELEMENT_IDS.config.size;
  // main <select />
  const main_el = document.getElementById(ids.main);
  // field that appears on custom size option
  const main_onchange_fn = getSizeSelectOnChange(
    document.getElementById(ids.custom.main)
  );
  main_el.addEventListener("change", (e) => {
    main_onchange_fn(e.currentTarget.value);
  });
  main_el.addEventListener("change", (e) => {
    updateGenButton();
  });
  main_onchange_fn(main_el.value);

  // custom size input elements
  const width_inp_el = document.getElementById(ids.custom.width);
  const height_inp_el = document.getElementById(ids.custom.height);
  // if width/height is loaded as invalid
  if (!isCustomSizeValid(width_inp_el.value)) {
    width_inp_el.value = "6";
  }
  if (!isCustomSizeValid(height_inp_el.value)) {
    height_inp_el.value = "6";
  }
  const width_inp_err_el = document.getElementById(ids.custom.width_err);
  const height_inp_err_el = document.getElementById(ids.custom.height_err);
  const width_onchange_fn = getCustomSizeInpOnChange(
    width_inp_err_el,
    INVALID_HEIGHT_ERROR_MESSAGES
  );
  const height_onchange_fn = getCustomSizeInpOnChange(
    height_inp_err_el,
    INVALID_HEIGHT_ERROR_MESSAGES
  );
  width_inp_el.addEventListener("change", (e) => {
    width_onchange_fn(e.currentTarget.value);
  });
  height_inp_el.addEventListener("change", (e) => {
    height_onchange_fn(e.currentTarget.value);
  });
  width_inp_el.addEventListener("change", (e) => {
    updateGenButton();
  });
  height_inp_el.addEventListener("change", (e) => {
    updateGenButton();
  });
}

function generate_board(board, width, heigth) {
  // expects board to be a table containing a tbody
  const body = board.children[0];
  let rows = [];
  for (let i = 0; i < heigth; i++) {
    const row = document.createElement("tr");
    row.id = `b-row-${i}`;
    let cells = [];

    for (let j = 0; j < width; j++) {
      const cell = document.createElement("td");
      cell.id = `b-cell-${i}-${j}`;
      cells.push(cell);
    }

    row.replaceChildren(...cells);
    rows.push(row);
  }

  body.replaceChildren(...rows);
  board.classList.remove("hidden");
}

function submitBoardGen() {
  const size = document.getElementById(ELEMENT_IDS.config.size.main);
  let width;
  let height;
  if (size.value === "custom") {
    width = document.getElementById(ELEMENT_IDS.config.size.custom.width).value;
    height = document.getElementById(
      ELEMENT_IDS.config.size.custom.height
    ).value;
  } else {
    const ind = size.value.indexOf("_");
    width = parseInt(size.value.substr(0, ind));
    height = parseInt(size.value.substr(ind + 1));
  }

  const board = document.getElementById(ELEMENT_IDS.main);
  generate_board(board, width, height);
}

function main() {
  console.log("hello world!");

  initialize_board_size_selection();
  const button = document.getElementById(ELEMENT_IDS.config.gen);
  button.addEventListener("click", (e) => {
    submitBoardGen();
  });
}

main();
