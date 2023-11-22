import Component from "./component.js";
import { hideElement, showElement } from "./css_h.js";
import { SERVER_URL } from "./index.js";

export default class LoginModal extends Component {
  static createElement() {
    // <div>
    //       <h2>Login</h2>
    //       <p>
    //         <label>Email: <input type="text" name="email" required /></label>
    //       </p>
    //       <p>
    //         <label
    //           >Password: <input type="password" name="password" required
    //         /></label>
    //       </p>

    //       <button type="submit">Log in</button>
    //     </div>

    const h2 = document.createElement("h2");
    h2.innerHTML = "Login";
    const p_user = document.createElement("p");
    const label_user = document.createElement("label");
    const input_user = document.createElement("input");
    input_user.type = "text";
    input_user.name = "user";
    label_user.append("Username :", input_user);
    p_user.appendChild(label_user);

    const p_pass = document.createElement("p");
    const label_pass = document.createElement("label");
    const input_pass = document.createElement("input");
    input_pass.type = "password";
    input_pass.name = "user";
    label_pass.append("Password :", input_pass);
    p_pass.appendChild(label_pass);

    const p_error = document.createElement("p");
    hideElement(p_error);
    p_error.classList.add("error");

    const button = document.createElement("button");
    button.innerHTML = "Login";

    const form = document.createElement("div");
    form.append(h2, p_user, p_pass, p_error, button);

    return {
      submit: button,
      forms: form,
      input_user: input_user,
      input_pass: input_pass,
      p_error: p_error,
    };
  }

  constructor(on_login) {
    const { submit, forms, input_user, input_pass, p_error } =
      LoginModal.createElement();
    super(forms);

    this.on_login = on_login;

    this.submit = submit;
    this.input_user = input_user;
    this.input_pass = input_pass;
    this.p_error = p_error;

    this.user = "";
    this.pass = "";

    input_user.addEventListener("change", (e) => {
      this.user = e.target.value;
      console.log(this);
    });
    input_pass.addEventListener("change", (e) => {
      this.pass = e.target.value;
      console.log(this);
    });

    input_user.addEventListener("keydown", (e) => {
      console.log(e);
      if (e.key == "Enter") {
        input_pass.focus();
      }
    });

    input_pass.addEventListener("keydown", (e) => {
      console.log(e);
      if (e.key == "Enter") {
        this.requestLogin();
      }
    });

    submit.addEventListener("click", (e) => {
      this.requestLogin();
    });
  }

  requestLogin() {
    this.submit.disabled = true; 

    const url = SERVER_URL + "/register";
    fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        nick: this.user,
        password: this.pass,
      }),
    }).then((response) => {
      if (response.ok) {
        this.on_login();
      } else {
        console.log("Error login", response);

        response.json().then((data) => {
          this.p_error.innerHTML = data.error;
          showElement(this.p_error);
          this.submit.disabled = false; 
        });
      }
    });
  }

  focusUsername() {
    this.input_user.focus();
  }
}
