import BoardArea from "./board/area.js";
import { hideElement, showElement } from "./css_h.js";
import LoginModal from "./login.js";

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

  // todo: implement modals for login and instructions

  const off_login = (e)=> {
    console.log(e);
    if (e.target.id != "login-modal-open" && !e.target.closest(".modal-content")){
      console.log("fecha");
      hideLoginModal(off_login);
    }
  };

  const on_login = () => {
    hideLoginModal(off_login);
    console.log("login");
  };
  const login_register = document.getElementById("login-modal");
  const login = new LoginModal(on_login);
  login_register.children[0].insertBefore(
    login.el(),
    login_register.children[0].children[0]
  );

  
  const login_button_open = document.getElementById("login-modal-open");
  login_button_open.addEventListener("click", () => {
    
    const modal = document.getElementById("login-modal");
    showElement(modal);
    login.focusUsername();

    document.addEventListener("click", a);
  });

  const login_button_close = document.getElementById("login-modal-close");
  login_button_close.addEventListener("click", () => {
    hideLoginModal(off_login);
  });
}

main();
