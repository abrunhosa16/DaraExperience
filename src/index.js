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

const generateBoard = (board, width, heigth) => {
  // expects board to be a table containing a tbody
  const body = board.children[0];
  const rows = [];
  for (let i = 0; i < heigth; i++) {
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

const initializeBoardSpace = (gen_data) => {
  console.log("creating board with data", gen_data);
  const board = document.getElementById(EL_IDS.main);
  generateBoard(board, parseInt(gen_data.width), parseInt(gen_data.height));
  const config = document.getElementById(EL_IDS.gen.main);
  const reset = document.getElementById(EL_IDS.reset);
  showElement(board);
  showElement(reset);
  hideElement(config);

  let last_selected_id = "b-cell-0-0";

  board.addEventListener("mousedown", (e) => {
    debug("mouse_down", true);
    console.log(e);
  });
  board.addEventListener("mouseup", (_) => debug("mouse_down", false));
  board.addEventListener("mouseleave", (_) => {
    debug("mouse_inside", false);
    debug("mouse_down", false);
  });
  board.addEventListener("mouseenter", (_) => {
    debug("mouse_inside", true);
  });
  board.addEventListener("mousemove", (e) => {
    const x = e.pageX - e.currentTarget.offsetLeft;
    const y = e.pageY - e.currentTarget.offsetTop;
    const bounds = board.getBoundingClientRect();
    const width = bounds.width;
    const height = bounds.height;
    const cell_x = ((gen_data.width * x) / width)>>0;
    const cell_y = ((gen_data.height * y) / height)>>0;

    debug("x", x);
    debug("y", y);
    debug("cell_x", cell_x);
    debug("cell_y", cell_y);

    const new_id = `b-cell-${cell_y}-${cell_x}`;
    if (new_id !== last_selected_id) {
      console.log("setting new hover!");
      const last_selected = document.getElementById(last_selected_id);
      last_selected.classList.remove("hovered");
      last_selected_id = new_id;
      const new_el = document.getElementById(new_id);
      new_el.classList.add("hovered");
    }
  });
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
