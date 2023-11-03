import BoardGen from "./board_gen/board_gen.js";
import { showElement, hideElement } from "./css_h.js";
import EL_IDS from "./ids.js";
import {BoardContainer} from "./board_container.js";

("use strict");

const initializeBoardSpace = (gen, configs) => {
  console.log("creating board with data", configs);
  const board = document.getElementById("board");
  const reset = document.getElementById(EL_IDS.reset);
  showElement(board);
  showElement(reset);
  hideElement(gen.el());

  // start game
  new BoardContainer(board, configs);
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
  const gen = new BoardGen((configs) => initializeBoardSpace(gen, configs));
  document.getElementById("board-gen").appendChild(gen.el());

  // const reset = document.getElementById("reset");
  // reset.addEventListener("click", (_) => {
  //   resetBoard();
  // });
}

main();
