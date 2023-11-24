import Component from "../component.js";
import Modal from "./modal.js";
import SignUpField from "./sign_up_field.js";

("use strict");

export default class SignUpModal extends Component {
  constructor(open_button_id, onSignUpCallback) {
    const field = new SignUpField((username, password) => {
      this.onSignUp(username, password);
    });
    const modal = new Modal(open_button_id, "Cancel", field);
    super(modal.el());

    this.base = modal;
    this.field = field;

    this.onSignUpCallback = onSignUpCallback;
  }

  onSignUp(username, password) {
    this.base.close();
    this.onSignUpCallback(username, password);
  }

  open() {
    this.field.clearPassword();
    this.base.open();
    this.field.focusUsername();
  }
}