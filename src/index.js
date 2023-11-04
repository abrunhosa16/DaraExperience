import BoardArea from "./board/area.js";

("use strict");

// const initializeBoardSpace = (gen, configs) => {
//   console.log("creating board with data", configs);
//   const board = document.getElementById("board");
//   const reset = document.getElementById(EL_IDS.reset);
//   showElement(board);
//   showElement(reset);
//   hideElement(gen.el());

//   // start game
//   new BoardContainer(board, configs);
// };

// const resetBoard = () => {
//   const board = document.getElementById(EL_IDS.main);
//   const config = document.getElementById(EL_IDS.gen.main);
//   const reset = document.getElementById(EL_IDS.reset);
//   showElement(config);
//   hideElement(board);
//   hideElement(reset);

// };

function main() {
  console.log("hello world!");
  // const gen = new BoardGen((configs) => initializeBoardSpace(gen, configs));
  const area_target = document.getElementById("board-area");
  const area = new BoardArea();
  area_target.parentElement.replaceChild(area.el(), area_target);

  // const reset = document.getElementById("reset");
  // reset.addEventListener("click", (_) => {
  //   resetBoard();
  // });
}

main();
