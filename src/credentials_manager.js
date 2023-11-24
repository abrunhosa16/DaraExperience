import SignUpModal from "./modals/sign_up_modal.js";

("use strict");

export default class CredentialsManager {
  constructor() {
    this.sign_up_button = document.createElement("button");
    this.sign_up_button.innerHTML = "Sign up";
    this.sign_up_button.id = "sign-up-modal-open";

    this.sign_up_modal = new SignUpModal(
      this.sign_up_button.id,
      (username, password) => {
        this.signUp(username, password);
      }
    );
    document.body.appendChild(this.sign_up_modal.el());
    this.sign_up_button.addEventListener("click", () => {
      this.sign_up_modal.open();
    });

    this.sign_out_button = document.createElement("button");
    this.sign_out_button.innerHTML = "Sign out";
    this.sign_out_button.addEventListener("click", () => {
      this.signOut();
    });

    this.block = document.getElementById("sign-button");
    this.block.appendChild(this.sign_up_button);

    this.signed_in = false;
    this.username = null;
    this.password = null;
  }

  trySignUp() {
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");
    if (username && password) {
      this.signUp(username, password);
    }
  }

  signUp(username, password) {
    console.log(username, "Logged in!");
    this.signed_in = true;
    this.username = username;
    this.password = password;

    this.block.removeChild(this.block.firstChild);
    this.block.appendChild(this.sign_out_button);

    localStorage.setItem("username", username);
    localStorage.setItem("password", password);
  }

  signOut() {
    console.log(this.username, "Logged out!");
    this.signed_in = false;
    this.username = null;
    this.password = null;

    this.block.removeChild(this.block.firstChild);
    this.block.appendChild(this.sign_up_button);

    localStorage.removeItem("username");
    localStorage.removeItem("password");
  }

  getUsername() {
    return this.username;
  }

  getPassword() {
    return this.password;
  }
}
