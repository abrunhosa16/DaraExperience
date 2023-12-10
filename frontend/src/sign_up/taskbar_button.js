import Component from "../component.js";

("use strict");


// taskbar button that changes if the user is logged in
export default class TaskbarSignupButton extends Component {
  static SIGN_UP_BUTTON_ID = "sign-up-modal-open";

  static signUpButton(sign_up_modal) {
    const sign_up_button = document.createElement("button");
    sign_up_button.innerHTML = "Sign up";
    sign_up_button.id = TaskbarSignupButton.SIGN_UP_BUTTON_ID;
    sign_up_button.addEventListener("click", () => {
      sign_up_modal.open();
      console.log(sign_up_modal);
    });

    return sign_up_button;
  }

  static signOutButton(crd_mgr) {
    const sign_out_button = document.createElement("button");
    sign_out_button.innerHTML = "Sign out";
    sign_out_button.addEventListener("click", () => {
      crd_mgr.signOut();
    });

    return sign_out_button;
  }

  constructor(crd_mgr, sign_up_modal) {
    const sign_up_button = TaskbarSignupButton.signUpButton(sign_up_modal);
    const sign_out_button = TaskbarSignupButton.signOutButton(crd_mgr);

    const base = document.createElement("div");
    if (crd_mgr.signedIn()) {
      base.appendChild(sign_out_button);
    } else {
      base.appendChild(sign_up_button);
    }

    super(base);

    crd_mgr.addSignUpCallback(() => {
      base.removeChild(base.firstChild);
      base.appendChild(sign_out_button);
    });

    crd_mgr.addSignOutCallback(() => {
      base.removeChild(base.firstChild);
      base.appendChild(sign_up_button);
    });
  }
}
