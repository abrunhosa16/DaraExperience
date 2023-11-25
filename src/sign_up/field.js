import Component from "../component.js";
import { showElement } from "../css_h.js";

("use strict");


// sign up form
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

  constructor(crd_mgr) {
    const { submit_button, base, username_input, password_input, error_field } =
      SignUpField.createElements();
    super(base);

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
      // see press enter event
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
        // sync value
        if (this.password !== password_input.value) {
          this.password = password_input.value;
        }
        this.attemptSignUp(crd_mgr);
      }
    });

    submit_button.addEventListener("click", (e) => {
      this.attemptSignUp(crd_mgr);
    });
  }

  attemptSignUp(crd_mgr) {
    this.submit_button.disabled = true;

    crd_mgr
      .signUp(this.username, this.password)
      .then(({ success, error_msg }) => {
        if (success) {
          // success
        } else {
          console.log("Error login", error_msg);
          this.error_field.innerHTML = error_msg;
          showElement(this.error_field);
        }
        this.submit_button.disabled = false;
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
