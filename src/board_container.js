import board_game from "./board_game.js";


const ROW_ID = "b-row";
const CELL_ID = "b-cell";
const INVALID_FLASH_TIME = 1000;

const paintOrange = (cell) => {
  cell.classList.add("orange");
}

const paintBeige = (cell) => {
  cell.classList.add("beige");
}

// hover a specific cell
// this cell should not have other statuses (like invalid)
const setHovered = (state, cell) => {
  if (state.hovered !== null) {
    if (state.hovered.id === cell.id) {
      return;
    }
    state.hovered.classList.remove("hovered");
  }
  cell.classList.add("hovered");
  state.hovered = cell;
}

const unsetHovered = (state) => {
  if (state.hovered === null) {
    return;
  }
  state.hovered.classList.remove("hovered");
  state.hovered = null;
}

const isBoardCell = (cell) => {
  return cell.id.startsWith(CELL_ID);
};

const getCoorsFromId = (id) => {
  const sliced = id.slice(CELL_ID.length + 1);
  const sep_i = sliced.indexOf("-");
  const y = parseInt(sliced.slice(0, sep_i));
  const x = parseInt(sliced.slice(sep_i + 1));
  return [x, y];
};

const flash_invalid = (state, cell) => {
  unsetHovered(state);

  if (state.invalid === null) {
    cell.classList.add("invalid");

    const timeout_id = setTimeout(() => {
      cell.classList.remove("invalid");
      state.invalid = null;
    }, INVALID_FLASH_TIME);

    state.invalid = {
      cell: cell,
      timeout_id: timeout_id
    }
  } else {
    if (state.invalid.cell.id === cell.id) {
      return;
    }
    // clear previous invalid
    clearTimeout(state.invalid.timeout_id);
    state.invalid.cell.classList.remove("invalid");
    state.invalid = null;

    // set new invalid cell (everything was cleared)
    flash_invalid(state, cell);
  }
}

const generateBoard = (board, configs) => {
  // expects board to be a table containing a tbody
  const body = board.children[0];
  const rows = [];
  for (let i = 0; i < configs.height; i++) {
    const row = document.createElement("tr");
    row.id = `${ROW_ID}-${i}`;
    const cells = [];

    for (let j = 0; j < configs.width; j++) {
      const cell = document.createElement("td");
      cell.id = `${CELL_ID}-${i}-${j}`;
      if ((i + j) % 2 === 0) {
        paintOrange(cell);
      } else {
        paintBeige(cell);
      }

      cells.push(cell);
    }

    row.replaceChildren(...cells);
    rows.push(row);
  }

  body.replaceChildren(...rows);
};

const initializeMovePhase = (state) => {
  // todo
  console.log("Initialize the move phase!");
}

const getDropPhaseOnClick = (state, intr_fun) => {
  return (e) => {
    const cell = e.target;
    if (!isBoardCell(cell)) {
      return;
    }
    const [x, y] = getCoorsFromId(e.target.id);

    let turn, drop_phase_ended;
    try {
      // returns true if drop phase has finished, false if just succeeded
      [turn, drop_phase_ended] = intr_fun(x, y);
    } catch (err) {
      flash_invalid(state, cell);
      // TODO: the message should appear to the user as a notification
      console.log(err.message);
      return;
    }

    if (drop_phase_ended) {
      initializeMovePhase(state);
    } else {
      e.target.innerHTML = turn ? 'B' : 'W';
    }
  }
}

const getOnMouseOver = (state) => {
  return (e) => {
    const cell = e.target;
    if (!isBoardCell(cell)) {
      return;
    }

    if (state.invalid?.cell?.id === cell.id) {
      return;
    }

    setHovered(state, cell);
  }
}


export default (board, configs) => {
  const state = {
    board: board,
    hovered: null,
    invalid: null,
  }
  generateBoard(board, configs);

  let internal_funcs = board_game(configs);

  // drop phase initialization
  const drop_phase_on_click = getDropPhaseOnClick(state, internal_funcs.playDropPhase);
  board.addEventListener("click", drop_phase_on_click);

  const on_mouse_over = getOnMouseOver(state);
  board.addEventListener("mouseover", on_mouse_over);
}