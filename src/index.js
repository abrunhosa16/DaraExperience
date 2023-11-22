import BoardArea from "./board/area.js";
import { hideElement, showElement } from "./css_h.js";
import SignUpModal from "./modals/sign_up_modal.js";

("use strict");

export const SERVER_URL = "http://twserver.alunos.dcc.fc.up.pt:8008";

function main() {
  const area_target = document.getElementById("game-gen-area");

  const area = new BoardArea();
  area_target.appendChild(area.el());

  const instructions_button_open = document.getElementById(
    "instructions-modal-open"
  );
  instructions_button_open.addEventListener("click", () => {
    const modal = document.getElementById("instructions-modal");
    showElement(modal);
  });

  const instructions_button_close = document.getElementById(
    "instructions-modal-close"
  );
  instructions_button_close.addEventListener("click", () => {
    const modal = document.getElementById("instructions-modal");
    hideElement(modal);
  });

  const sign_up_modal = new SignUpModal("sign-up-modal-open");
  document.body.appendChild(sign_up_modal.el());
  // Open sign up modal when clicking on the taskbar button
  document
    .getElementById("sign-up-modal-open")
    .addEventListener("click", () => {
      sign_up_modal.open();
    });
}

main();
