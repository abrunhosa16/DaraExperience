import BoardArea from "./board/area.js";

("use strict");

function main() {
  console.log("hello world!");

  const area_target = document.getElementById("board-area");

  const area = new BoardArea();
  area_target.parentElement.replaceChild(area.el(), area_target);
}

main();
