import board_gen from "./board_gen.js";
import { showElement, hideElement } from "./css_h.js";
import EL_IDS from "./ids.js";
import board_container from "./board_container.js";

("use strict");

const initializeBoardSpace = (configs) => {
  console.log("creating board with data", configs);
  const board = document.getElementById(EL_IDS.main);
  const config = document.getElementById(EL_IDS.gen.main);
  const reset = document.getElementById(EL_IDS.reset);
  showElement(board);
  showElement(reset);
  hideElement(config);

  // start game
  board_container(board, configs);
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
