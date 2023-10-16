import {
  showElement,
  hideElement,
  markAsSelected,
  markAsUnselected,
} from "./css_h.js";
import EL_IDS from "./ids.js";

("use strict");

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

// should run every time some gen state is updated
// disables the button if there are errors
const updateGenButton = (state) => {
  const button = document.getElementById(EL_IDS.gen.submit);
  button.disabled = state.error_count > 0;
};

// test for validity of a value
// returns true if valid
const isCustomSizeValid = (val) => {
  // val expected to be null or Int
  return val && parseInt(val) >= MIN_HEIGHT_WIDTH;
};

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
};

// update custom width field with any string, with error notifications
const setCustomWidth = (state, new_val) => {
  const el = document.getElementById(EL_IDS.gen.size.custom.width);
  const err_el = document.getElementById(
    EL_IDS.gen.size.custom.width_err
  );

  const old_was_valid = isCustomSizeValid(state.width);
  const err = getCustomSizeErrorMessage(new_val, INVALID_WIDTH_ERROR_MESSAGES);

  state.width = new_val;
  el.value = new_val;
  if (err === null) {
    if (!old_was_valid) {
      state.error_count -= 1;
    }

    hideElement(err_el);
  } else {
    if (old_was_valid) {
      state.error_count += 1;
    }

    err_el.innerHTML = err;
    showElement(err_el);
  }

  updateGenButton(state);
};

// change custom width field with a new value without checking for errors
const setCustomWidthUnchecked = (state, new_val) => {
  const el = document.getElementById(EL_IDS.gen.size.custom.width);
  const err_el = document.getElementById(
    EL_IDS.gen.size.custom.width_err
  );

  const old_was_valid = isCustomSizeValid(state.width);
  if (!old_was_valid) {
    state.error_count -= 1;
  }
  state.width = new_val;
  el.value = new_val;

  hideElement(err_el);

  updateGenButton(state);
};

// this function should be analogous to the width counterpart
const setCustomHeight = (state, new_val) => {
  const el = document.getElementById(EL_IDS.gen.size.custom.height);
  const err_el = document.getElementById(
    EL_IDS.gen.size.custom.height_err
  );

  const old_was_valid = isCustomSizeValid(state.height);
  const err = getCustomSizeErrorMessage(new_val, INVALID_HEIGHT_ERROR_MESSAGES);

  state.height = new_val;
  el.value = new_val;
  if (err === null) {
    if (!old_was_valid) {
      state.error_count -= 1;
    }

    hideElement(err_el);
  } else {
    if (old_was_valid) {
      state.error_count += 1;
    }

    err_el.innerHTML = err;
    showElement(err_el);
  }

  updateGenButton(state);
};

const setCustomHeightUnchecked = (state, new_val) => {
  const el = document.getElementById(EL_IDS.gen.size.custom.height);
  const err_el = document.getElementById(
    EL_IDS.gen.size.custom.height_err
  );

  const old_was_valid = isCustomSizeValid(state.height);
  if (!old_was_valid) {
    state.error_count -= 1;
  }
  state.height = new_val;
  el.value = new_val.toString();

  hideElement(err_el);

  updateGenButton(state);
};

const parseSizeSelection = (val) => {
  const ind = val.indexOf("_");
  const width = parseInt(val.substr(0, ind));
  const height = parseInt(val.substr(ind + 1));
  return [width, height];
};

const setSizeSelection = (state, new_val) => {
  const custom_size_field = document.getElementById(
    EL_IDS.gen.size.custom.main
  );
  if (new_val === "custom") {
    setCustomWidth(state, state.width);
    setCustomHeight(state, state.height);
    showElement(custom_size_field);
  } else {
    const r = parseSizeSelection(new_val);
    setCustomWidthUnchecked(state, r[0]);
    setCustomHeightUnchecked(state, r[1]);
    hideElement(custom_size_field);
  }
};

const setButtonOptionDecorator = (
  button_value_ids,
  get_last_val,
  set_current_val
) => {
  return (new_val) => {
    const last_selected = document.getElementById(
      button_value_ids[get_last_val()]
    );
    const selected_now = document.getElementById(button_value_ids[new_val]);
    markAsUnselected(last_selected);
    markAsSelected(selected_now);
    set_current_val(new_val);
  };
};

const setWhitePlayer = (state) =>
  setButtonOptionDecorator(
    {
      human: EL_IDS.gen.white.human,
      random: EL_IDS.gen.white.random,
      ai: EL_IDS.gen.white.ai,
    },
    () => state.white,
    (new_val) => (state.white = new_val)
  );

const setBlackPlayer = (state) =>
  setButtonOptionDecorator(
    {
      human: EL_IDS.gen.black.human,
      random: EL_IDS.gen.black.random,
      ai: EL_IDS.gen.black.ai,
    },
    () => state.black,
    (new_val) => (state.black = new_val)
  );

const setStartingPlayer = (state) =>
  setButtonOptionDecorator(
    {
      white: EL_IDS.gen.starting_player.white,
      black: EL_IDS.gen.starting_player.black,
      random: EL_IDS.gen.starting_player.random,
    },
    () => state.starting_player,
    (new_val) => (state.starting_player = new_val)
  );

// adds all handlers to size selection elements
const initializeBoardSizeSelection = (state) => {
  const ids = EL_IDS.gen.size;
  // main <select />
  console.log(ids.main);
  const main_el = document.getElementById(ids.main);
  const custom_width = document.getElementById(ids.custom.width);
  const custom_height = document.getElementById(ids.custom.height);
  main_el.addEventListener("change", (e) => {
    setSizeSelection(state, e.currentTarget.value);
  });
  if (main_el.value === "custom") {
    // if the browser "remembers" custom values, initialize them as that
    state.width = custom_width.value;
    if (!isCustomSizeValid(custom_width.value)) {
      state.error_count += 1;
    }
    state.height = custom_height.value;
    if (!isCustomSizeValid(custom_height.value)) {
      state.error_count += 1;
    }
  }
  setSizeSelection(state, main_el.value);

  // custom width and height input fields
  document.getElementById(ids.custom.width).addEventListener("change", (e) => {
    setCustomWidth(state, e.currentTarget.value);
  });
  document.getElementById(ids.custom.height).addEventListener("change", (e) => {
    setCustomHeight(state, e.currentTarget.value);
  });
};

const initializePlayerSelectionButtons = (state) => {
  const setWhitePlayerWithState = setWhitePlayer(state);
  const setBlackPlayerWithState = setBlackPlayer(state);
  const setStartingPlayerWithState = setStartingPlayer(state);
  // player selection buttons
  const button_assignments = {
    [EL_IDS.gen.white.human]: [setWhitePlayerWithState, "human"],
    [EL_IDS.gen.white.random]: [setWhitePlayerWithState, "random"],
    [EL_IDS.gen.white.ai]: [setWhitePlayerWithState, "ai"],
    [EL_IDS.gen.black.human]: [setBlackPlayerWithState, "human"],
    [EL_IDS.gen.black.random]: [setBlackPlayerWithState, "random"],
    [EL_IDS.gen.black.ai]: [setBlackPlayerWithState, "ai"],
    [EL_IDS.gen.starting_player.white]: [
      setStartingPlayerWithState,
      "white",
    ],
    [EL_IDS.gen.starting_player.black]: [
      setStartingPlayerWithState,
      "black",
    ],
    [EL_IDS.gen.starting_player.random]: [
      setStartingPlayerWithState,
      "random",
    ],
  };
  for (const [id, [fun, par]] of Object.entries(button_assignments)) {
    document.getElementById(id).addEventListener("click", (_) => {
      fun(par);
    });
  }
  setWhitePlayerWithState(state.white);
  setBlackPlayerWithState(state.black);
  setStartingPlayerWithState(state.starting_player);
};

export default (genBoardCallback) => {
  const state = {
    width: "6",
    height: "6",
    white: "human",
    black: "human",
    starting_player: "random",
    error_count: 0,
  };
  initializeBoardSizeSelection(state);
  initializePlayerSelectionButtons(state);

  const gen = document.getElementById(EL_IDS.gen.submit);
  gen.addEventListener("click", (_) => {
    genBoardCallback({
      width: parseInt(state.width),
      height: parseInt(state.height),
      white_player: state.white,
      black_player: state.black,
      starting_player: state.starting_player,
      white_count: 25,
      black_count: 25
    });
  });
};
