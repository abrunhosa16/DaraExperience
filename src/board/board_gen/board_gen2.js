import BoardSizeInput from "./size_input.js";
import MultiButtonSelection from "./multi_button_selection.js";
import Component from "../../component.js";
import BoardToggle from "./toggle.js";
import DropChoose from "./drop_choose.js";

("use strict");

export default class BoardGen extends Component {
  static createElements(cred_mgr) {
    console.log(cred_mgr);
    const title = document.createElement("h2");
    title.innerHTML = "Start playing";

    const online_title = document.createElement("h3");
    online_title.innerHTML = "Play mode";

    const online_sel = new MultiButtonSelection(
      "online",
      "",
      {
        online: "Play against another player online",
        offline: "Play locally or against an AI",
      },
      "online"
    );

    const online_offline_gen = document.createElement("div");
    online_offline_gen.innerHTML = cred_mgr.signedIn()
      ? "Can play"
      : "Needs signing";

    const base = document.createElement("div");
    base.classList.add("board-config");
    base.append(title, online_title, online_sel.el(), online_offline_gen);

    return {
      base: base,
      online_sel: online_sel,
      online_offline_gen: online_offline_gen,
    };
  }

  constructor(cred_mgr, submit_callback) {
    const { base, online_sel, online_offline_gen } =
      BoardGen.createElements(cred_mgr);
    super(base);

    cred_mgr.addSignUpCallback(() => {
      online_offline_gen.innerHTML = "Can play";
    });
    cred_mgr.addSignOutCallback(() => {
      online_offline_gen.innerHTML = "Needs signing";
    });
  }
}
