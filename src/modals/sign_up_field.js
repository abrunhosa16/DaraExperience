import Component from "../component.js";
import { showElement } from "../css_h.js";
import { SERVER_URL } from "../index.js";

("use strict");

export default class SignUpField extends Component {
  static createElements() {
    const header = document.createElement("h2");
    header.innerHTML = "Register or sign in";

    const username_input = document.createElement("input");
    username_input.type = "text";
    username_input.name = "username";

    const password_input = document.createElement("input");
    password_input.type = "password";
    password_input.name = "password";

    // labels for the inputs
    const username_label = document.createElement("label");
    username_label.append("Username:", username_input);
    const password_label = document.createElement("label");
    password_label.append("Password :", password_input);

    // paragraph fields for the labels
    const username_field = document.createElement("p");
    username_field.appendChild(username_label);
    const password_field = document.createElement("p");
    password_field.appendChild(password_label);

    const error_field = document.createElement("p");
    error_field.classList.add("error", "hidden");

    const submit_button = document.createElement("button");
    submit_button.innerHTML = "Sign up";

    const form = document.createElement("div");
    form.append(
      header,
      username_field,
      password_field,
      error_field,
      submit_button
    );

    return {
      submit_button: submit_button,
      base: form,
      username_input: username_input,
      password_input: password_input,
      error_field: error_field,
    };
  }

  constructor(crd_mgr, onSignUpCallback) {
    const { submit_button, base, username_input, password_input, error_field } =
    SignUpField.createElements();
    super(base);

    this.onSignUpCallback = onSignUpCallback;

    this.username_input = username_input;
    this.password_input = password_input;
    this.submit_button = submit_button;
    this.error_field = error_field;

    this.username = "";
    this.password = "";

    username_input.addEventListener("change", (e) => {
      this.username = e.target.value;
    });
    password_input.addEventListener("change", (e) => {
      this.password = e.target.value;
    });

    // Focus password field when pressing enter
    username_input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        password_input.focus();
      }
    });

    // submit when pressing enter
    password_input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.attemptSignUp();
      }
    });

    submit_button.addEventListener("click", (e) => {
      this.attemptSignUp(crd_mgr);
    });
  }

  attemptSignUp(crd_mgr) {
    this.submit_button.disabled = true;

    crd_mgr.signUp(this.username, this.password).then(({success, error_msg}) {
      // todo
    })

    const url = SERVER_URL + "/register";
    fetch(url, {
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
    }).then((response) => {
      if (response.ok) {
        // use values before fetch started (or else they could have changed)
        this.onSignUpCallback(username_copy, password_copy);
      } else {
        console.log("Error login", response);

        response.json().then((data) => {
          this.error_field.innerHTML = data.error;
          showElement(this.error_field);
          this.submit_button.disabled = false;
        });
      }
    });
  }

  focusUsername() {
    this.username_input.focus();
    this.username_input.select();
  }

  clearPassword() {
    this.password_input.value = "";
    this.password = "";
  }
}
