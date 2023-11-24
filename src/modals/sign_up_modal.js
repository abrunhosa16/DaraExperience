import Component from "../component.js";
import Modal from "./modal.js";
import SignUpField from "./sign_up_field.js";

("use strict");

export default class SignUpModal extends Component {
  constructor(open_button_ids) {
    const field = new SignUpField(() => {
      this.base.close();
    });
    const modal = new Modal(open_button_ids, "Cancel", field);
    super(modal.el());

    this.base = modal;
    this.field = field;
  }

  open() {
    this.field.clearPassword();
    this.base.open();
    this.field.focusUsername();
  }
}
