import board_gen from "./board_gen.js";
import {
  showElement,
  hideElement,
} from "./css_h.js";
import EL_IDS from "./ids.js";

("use strict");

var debugData = {};
const debug = (subj, message) => {
  debugData[subj] = message;
  document.getElementById("debug").innerHTML = JSON.stringify(debugData, null, 2);
};

const generateBoard = (board, width, height) => {
  // expects board to be a table containing a tbody
  const body = board.children[0];
  const rows = [];
  for (let i = 0; i < height; i++) {
    const row = document.createElement("tr");
    row.id = `b-row-${i}`;
    const cells = [];

    for (let j = 0; j < width; j++) {
      const cell = document.createElement("td");
      cell.id = `b-cell-${i}-${j}`;
      const evenOdd = (i+j) % 2 === 0;
      cell.classList.add(evenOdd ? "orange" : "bege"); 
      cells.push(cell);
    }
    
    row.replaceChildren(...cells);
    rows.push(row);
  }

  body.replaceChildren(...rows);
};

const isBoardCell = (id) => {
  return id.startsWith("b-cell");
}

const getCellCoors = (board, width, height, e) => {
  const x = e.pageX - e.currentTarget.offsetLeft;
  const y = e.pageY - e.currentTarget.offsetTop;
  const bounds = board.getBoundingClientRect();
  const cell_x = ((width * x) / bounds.width)>>0;
  const cell_y = ((height * y) / bounds.height)>>0;
  return [cell_x, cell_y];
}

const handleBoardEvents = (gen_data) => {
  let last_selected_id = "b-cell-0-0";
  let mouse_down = false;
  let dragging = null;

  board.addEventListener("click", (e) => {
    console.log("click!");
    console.log(e);
  })
  board.addEventListener("mousedown", (e) => {
    debug("mouse_down", true);
    mouse_down = true;
  });
  board.addEventListener("mouseup", (e) => {
    debug("mouse_down", false)
    mouse_down = false;
    if (dragging) {
      console.log("drag cancel!");
      debug("dragging", dragging);
      debug("dragged_onto", e.target.id);
    }
  });
  board.addEventListener("mouseleave", (_) => {
    debug("mouse_inside", false);
    debug("mouse_down", false);
    mouse_down = false;
    dragging = null;
    debug("dragging", dragging);
  });
  board.addEventListener("mouseenter", (_) => {
    debug("mouse_inside", true);
  });
  board.addEventListener("mousemove", (e) => {
    if (!isBoardCell(e.target.id)) {
      return;
    }
    const cur_id = e.target.id;
    debug("hover_id", cur_id);
    if (mouse_down && dragging === null) {
      dragging = cur_id;
      debug("dragging", dragging);
    }

    if (cur_id !== last_selected_id) {
      console.log("setting new hover!");
      const last_selected = document.getElementById(last_selected_id);
      last_selected.classList.remove("hovered");
      last_selected_id = cur_id;
      const new_el = document.getElementById(cur_id);
      new_el.classList.add("hovered");
    }
  });
  
}

const initializeBoardSpace = (gen_data) => {
  console.log("creating board with data", gen_data);
  const board = document.getElementById(EL_IDS.main);
  generateBoard(board, parseInt(gen_data.width), parseInt(gen_data.height));
  const config = document.getElementById(EL_IDS.gen.main);
  const reset = document.getElementById(EL_IDS.reset);
  showElement(board);
  showElement(reset);
  hideElement(config);

  handleBoardEvents(gen_data);
};

const resetBoard = () => {
  const board = document.getElementById(EL_IDS.main);
  const config = document.getElementById(EL_IDS.gen.main);
  const reset = document.getElementById(EL_IDS.reset);
  showElement(config);
  hideElement(board);
  hideElement(reset);
};

function main() {
  console.log("hello world!");
  board_gen(initializeBoardSpace);

  const reset = document.getElementById(EL_IDS.reset);
  reset.addEventListener("click", (_) => {
    resetBoard();
  });

}

main();
