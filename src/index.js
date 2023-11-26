import GameArea from "./game_area.js";
import { BOARD_GEN_SIGN_BUTTON_ID } from "./game_options/online.js";
import CredentialsManager from "./credentials_manager.js";
import { hideElement, showElement } from "./css_h.js";
import SignUpModal from "./sign_up/modal.js";
import TaskbarSignupButton from "./sign_up/taskbar_button.js";

("use strict");

export const SERVER_URL = "http://twserver.alunos.dcc.fc.up.pt:8008";

function main() {
  const crd_mgr = new CredentialsManager();
  crd_mgr.trySignUpFromLocalStorage();

  const taskbar_signup_target = document.getElementById("sign-button");
  const signup_modal = new SignUpModal(crd_mgr, [TaskbarSignupButton.SIGN_UP_BUTTON_ID, BOARD_GEN_SIGN_BUTTON_ID]);
  document.body.appendChild(signup_modal.el());

  const taskbar_signup = new TaskbarSignupButton(crd_mgr, signup_modal);
  taskbar_signup_target.appendChild(taskbar_signup.el());

  const area_target = document.getElementById("game-gen-area");
  const area = new GameArea(crd_mgr, signup_modal);
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
