import BoardArea from "./board/area.js";
import { hideElement, showElement } from "./css_h.js";

("use strict");

function main() {
  console.log("hello world!");

  const area_target = document.getElementById("game-gen-area");

  const area = new BoardArea();
  area_target.appendChild(area.el());

  const instructions_button_open = document.getElementById("instructions-modal-open");
  instructions_button_open.addEventListener("click", () => {
    const modal = document.getElementById("instructions-modal");
    showElement(modal);
  });

  const instructions_button_close = document.getElementById("instructions-modal-close");
  instructions_button_close.addEventListener("click", () => {
    const modal = document.getElementById("instructions-modal");
    hideElement(modal);
  });

  const login_button_open = document.getElementById("login-modal-open");
  login_button_open.addEventListener("click", () => {
    const modal = document.getElementById("login-modal");
    showElement(modal);
  });

  const login_button_close = document.getElementById("login-modal-close");
  login_button_close.addEventListener("click", () => {
    const modal = document.getElementById("login-modal");
    hideElement(modal);
  })
}

main();
