import Component from "../component.js";
import Modal from "./modal.js";
import SignUpField from "./sign_up_field.js";

("use strict");

export default class SignUpModal extends Component {
  static createElements() {}

  constructor(open_button_id) {
    const field = new SignUpField(() => {
      this.onSignUp();
    });
    const modal = new Modal(open_button_id, "Cancel", field);
    super(modal.el());

    this.base = modal;
    this.field = field;
  }

  onSignUp() {
    console.log("Logged in!");
    this.base.close();
  }

  open() {
    this.field.clearPassword();
    this.base.open();
    this.field.focusUsername();
  }
}
