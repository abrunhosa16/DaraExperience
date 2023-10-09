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
    main: "b-gen-area",

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

// TODO: is using global variables the right choice?
// contains all board gen info
var boardGenState = {
  width: "6",
  height: "6",
  ai_game: false,
  whites_first: true,
  error_count: 0
};

const showElement = (el) => el.classList.remove("hidden");
const hideElement = (el) => el.classList.add("hidden");

// should run every time some gen state is updated
const updateGenButton = () => {
  const button = document.getElementById(ELEMENT_IDS.config.gen);
  button.disabled = boardGenState.error_count > 0;
}


// test for validity of a value
// returns true if valid
const isCustomSizeValid = (val) => {
  // val expected to be null or Int
  return val && parseInt(val) >= MIN_HEIGHT_WIDTH;
}

// test for a validity of a value
// returns null if valid, otherwise an error string
const getCustomSizeErrorMessage = (val, err_messages) => {
  // expects val to be a integer if valid
  if (!val) {
    return err_messages.required;
  }
  if (parseInt(val) < MIN_HEIGHT_WIDTH) {
    return err_messages.too_small;
  }
  return null;
}

// update custom width field with any string, with error notifications
const setCustomWidth = (new_val) => {
  const el = document.getElementById(ELEMENT_IDS.config.size.custom.width);
  const err_el = document.getElementById(ELEMENT_IDS.config.size.custom.width_err);
  
  const old_was_valid = isCustomSizeValid(boardGenState.width);
  const err = getCustomSizeErrorMessage(new_val, INVALID_WIDTH_ERROR_MESSAGES);

  boardGenState.width = new_val;
  el.value = new_val;
  if (err === null) {
    if (!old_was_valid) {
      boardGenState.error_count -= 1;
    }

    hideElement(err_el);
  } else {
    if (old_was_valid) {
      boardGenState.error_count += 1;
    }

    err_el.innerHTML = err;
    showElement(err_el);
  }

  updateGenButton();
}

// change custom width field with a new value without checking for errors
const setCustomWidthUnckecked = (new_val) => {
  const el = document.getElementById(ELEMENT_IDS.config.size.custom.width);
  const err_el = document.getElementById(ELEMENT_IDS.config.size.custom.width_err);
  
  const old_was_valid = isCustomSizeValid(boardGenState.width);
  if (!old_was_valid) {
    boardGenState.error_count -= 1;
  }
  boardGenState.width = new_val;
  el.value = new_val;

  hideElement(err_el);

  updateGenButton();
}

// this function should be analogous to the width counterpart
const setCustomHeight = (new_val) => {
  const el = document.getElementById(ELEMENT_IDS.config.size.custom.height);
  const err_el = document.getElementById(ELEMENT_IDS.config.size.custom.height_err);
  
  const old_was_valid = isCustomSizeValid(boardGenState.height);
  const err = getCustomSizeErrorMessage(new_val, INVALID_HEIGHT_ERROR_MESSAGES);

  boardGenState.height = new_val;
  el.value = new_val;
  if (err === null) {
    if (!old_was_valid) {
      boardGenState.error_count -= 1;
    }

    hideElement(err_el);
  } else {
    if (old_was_valid) {
      boardGenState.error_count += 1;
    }

    err_el.innerHTML = err;
    showElement(err_el);
  }

  updateGenButton();
}

const setCustomHeightUnckecked = (new_val) => {
  const el = document.getElementById(ELEMENT_IDS.config.size.custom.height);
  const err_el = document.getElementById(ELEMENT_IDS.config.size.custom.height_err);
  
  const old_was_valid = isCustomSizeValid(boardGenState.height);
  if (!old_was_valid) {
    boardGenState.error_count -= 1;
  }
  boardGenState.height = new_val;
  el.value = new_val.toString();

  hideElement(err_el);

  updateGenButton();
}

const parseSizeSelection = (val) => {
  const ind = val.indexOf("_");
  const width = parseInt(val.substr(0, ind));
  const height = parseInt(val.substr(ind + 1));
  return [width, height];
}

const setSizeSelection = (new_val) => {
  const custom_size_field = document.getElementById(ELEMENT_IDS.config.size.custom.main);
  if (new_val === "custom") {
    setCustomWidth(boardGenState.width);
    setCustomHeight(boardGenState.height);
    showElement(custom_size_field);
  } else {
    const r = parseSizeSelection(new_val);
    setCustomWidthUnckecked(r[0]);
    setCustomHeightUnckecked(r[1]);
    hideElement(custom_size_field);
  }
}

// adds all handlers to size selection elements
const initialize_board_size_selection = () => {
  const ids = ELEMENT_IDS.config.size;
  // main <select />
  const main_el = document.getElementById(ids.main);
  const custom_width = document.getElementById(ids.custom.width);
  const custom_height = document.getElementById(ids.custom.height);
  main_el.addEventListener("change", (e) => {
    setSizeSelection(e.currentTarget.value);
  });
  if (main_el.value === "custom") {
    // if the browser "remembers" custom values, initialize them as that
    boardGenState.width = custom_width.value;
    if (!isCustomSizeValid(custom_width.value)) {
      boardGenState.error_count += 1;
    }
    boardGenState.height = custom_height.value;
    if (!isCustomSizeValid(custom_height.value)) {
      boardGenState.error_count += 1;
    }
  }
  setSizeSelection(main_el.value);

  // custom width and height input fields
  document.getElementById(ids.custom.width).addEventListener("change", (e) => {
    setCustomWidth(e.currentTarget.value);
  });
  document.getElementById(ids.custom.height).addEventListener("change", (e) => {
    setCustomHeight(e.currentTarget.value);
  });
}

const generate_board = (board, width, heigth) => {
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

const submitBoardGen = () => {
  const board = document.getElementById(ELEMENT_IDS.main);
  generate_board(board, boardGenState.width, boardGenState.height);
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
