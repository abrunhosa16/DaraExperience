import { SERVER_URL } from "./index.js";

("use strict");

// Makes register / login operations and stores user credentials
export default class CredentialsManager {
  constructor() {
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
    console.log(username, password)
    const username_copy = (" " + username).slice(1);
    const password_copy = (" " + password).slice(1);

    const url = SERVER_URL + "/register";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        nick: username_copy,
        password: password_copy,
      }),
    });

    if (response.ok) {
      // use values before fetch started (or else they could have changed)
      this.completeSignIn(username_copy, password_copy);
      return { success: true, error_msg: null };
    } else {
      const error_data = await response.json();

      return { success: true, error_msg: error_data.error_field };
    }
  }

  completeSignIn(username, password) {
    console.log(username, "Logged in!");
    this.signed_in = true;
    this.username = username;
    this.password = password;

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
