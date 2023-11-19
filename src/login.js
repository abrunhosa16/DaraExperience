import Component from "./component.js";
import { SERVER_URL } from "./index.js";

export default class LoginModal extends Component {
  static createElement() {
    // <form>
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
    //     </form>

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

    const button = document.createElement("button");
    button.innerHTML = "Login";

    const form = document.createElement("div");
    form.append(h2, p_user, p_pass, button);

    return {
      submit: button,
      forms: form,
      input_user: input_user,
      input_pass: input_pass,
    };
  }

  constructor() {
    const { submit, forms, input_user, input_pass } =
      LoginModal.createElement();
    super(forms);

    this.submit = submit;
    this.input_user = input_user;
    this.input_pass = input_pass;

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

    submit.addEventListener("click", async (e) => {
      console.log(this);
      const url = SERVER_URL + "/register";
      const request = await fetch(url, {
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
      });

      const response = await request.json();
      console.log(response);
    });
  }
}
