import Component from "../component.js";
import Modal from "../modal.js";
import SignUpField from "./field.js";

("use strict");

export default class SignUpModal extends Component {
  constructor(crd_mgr, open_button_ids) {
    const field = new SignUpField(crd_mgr);
    const modal = new Modal(open_button_ids, "Cancel", field);
    super(modal.el());

    this.base = modal;
    this.field = field;

    // close modal on login
    crd_mgr.addSignUpCallback(() => {
      this.base.close();
    });
  }

  open() {
    this.field.clearPassword();
    this.base.open();
    this.field.focusUsername();
  }
}
