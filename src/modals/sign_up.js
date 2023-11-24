import SignUpModal from "./sign_up_modal.js";

("use strict");

export default class SignUp {
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

    this.sign_up_callbacks = new Set();
    this.sign_out_callbacks = new Set();
  }

  addSignUpCallback(callback) {
    this.sign_up_callbacks.add(callback);
  }

  removeSignUpCallback(callback) {
    this.sign_up_callbacks.delete(callback);
  }

  addSignOutCallback(callback) {
    this.sign_out_callbacks.add(callback);
  }

  removeSignOutCallback(callback) {
    this.sign_out_callbacks.delete(callback);
  }

  trySignUpFromLocalStorage() {
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");
    if (username && password) {
      this.signUp(username, password);
    }
  }

  async signUp(username, password) {
    const username_copy = (" " + this.username).slice(1);
    const password_copy = (" " + this.password).slice(1);

    const url = SERVER_URL + "/register";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        nick: this.username,
        password: this.password,
      }),
    });

    if (response.ok) {
      // use values before fetch started (or else they could have changed)
      this.completeSignIn(username_copy, password_copy);
      return { success: true, error: null };
    } else {
      const error_data = await response.json();

      return { success: true, error: error_data.error_field };
    }
  }

  completeSignIn(username, password) {
    console.log(username, "Logged in!");
    this.signed_in = true;
    this.username = username;
    this.password = password;

    this.block.removeChild(this.block.firstChild);
    this.block.appendChild(this.sign_out_button);

    localStorage.setItem("username", username);
    localStorage.setItem("password", password);

    this.sign_up_callbacks.forEach((callback) => {
      callback(username, password);
    });
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

    this.sign_out_callbacks.forEach((callback) => {
      callback();
    });
  }

  getUsername() {
    return this.username;
  }

  getPassword() {
    return this.password;
  }

  signedIn() {
    return this.signed_in;
  }
}
