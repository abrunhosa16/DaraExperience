import board_gen from "./board_gen.js";
import {
  showElement,
  hideElement,
} from "./css_h.js";
import EL_IDS from "./ids.js";

("use strict");

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
