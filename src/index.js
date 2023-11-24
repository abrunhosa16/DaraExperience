import BoardArea from "./board/area.js";
import CredentialsManager from "./credentials_manager.js";
import { hideElement, showElement } from "./css_h.js";

("use strict");

export const SERVER_URL = "http://twserver.alunos.dcc.fc.up.pt:8008";

function main() {
  const area_target = document.getElementById("game-gen-area");

  const credentials_manager = new CredentialsManager();
  credentials_manager.trySignUp();

  const area = new BoardArea(credentials_manager);
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
}

main();
