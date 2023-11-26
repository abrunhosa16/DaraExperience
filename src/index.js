import BoardArea from "./board/area.js";
import { BOARD_GEN_SIGN_BUTTON_ID } from "./board/board_gen/online_gen.js";
import CredentialsManager from "./credentials_manager.js";
import { hideElement, showElement } from "./css_h.js";
import { createRanking } from "./ranking.js";
import SignUpModal from "./sign_up/modal.js";
import TaskbarSignupButton from "./sign_up/taskbar_button.js";
import { getRanking } from "./request_ranking.js";
import rankingArea from "./ranking_area.js";

("use strict");

export const SERVER_URL = "http://twserver.alunos.dcc.fc.up.pt:8008";
export const GROUP = 12;

function main() {
  const crd_mgr = new CredentialsManager();
  console.log(23232)
  crd_mgr.trySignUpFromLocalStorage();
  console.log(12312)

  const taskbar_signup_target = document.getElementById("sign-button");
  const signup_modal = new SignUpModal(crd_mgr, [TaskbarSignupButton.SIGN_UP_BUTTON_ID, BOARD_GEN_SIGN_BUTTON_ID]);
  document.body.appendChild(signup_modal.el());

  const taskbar_signup = new TaskbarSignupButton(crd_mgr, signup_modal);
  taskbar_signup_target.appendChild(taskbar_signup.el());

  const area_target = document.getElementById("game-gen-area");
  const area = new BoardArea(crd_mgr, signup_modal);
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

  getRanking(5, 6).then((data) => {
  createRanking(data);
  });

  const div_ranking = new rankingArea();
  const el_rank = document.getElementById("ranking_area");
  el_rank.appendChild(div_ranking.el());
  
}

main();
