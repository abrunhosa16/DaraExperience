import Modal from "../modal.js";
import SignUpField from "./field.js";

("use strict");

export default class SignUpModal extends Modal {
  constructor(crd_mgr, open_button_ids) {
    const field = new SignUpField(crd_mgr);
    super(open_button_ids, "Cancel", field);

    this.field = field;

    // close modal on login
    crd_mgr.addSignUpCallback(() => {
      super.close();
    });
  }

  open() {
    this.field.clearPassword();
    super.open();
    this.field.focusUsername();
  }
}
