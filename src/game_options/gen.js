import MultiButtonSelection from "../misc_components/multi_button_selection.js";
import Component from "../component.js";
import OfflineGameGen from "./offline.js";
import OnlineGameGen from "./online.js";

("use strict");

export default class GameGen extends Component {
  static createElements(cred_mgr) {
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
    
    const base = document.createElement("div");
    base.classList.add("game-gen");
    base.append(title, online_title, online_sel.el(), online_offline_gen);

    return {
      base: base,
      online_sel: online_sel,
      online_offline_gen: online_offline_gen,
    };
  }

  setOnline(sign_up_modal) {
    this.online_offline_gen.innerHTML = "";
    const online = new OnlineGameGen(this.cred_mgr, this.submit_callback, sign_up_modal);
    this.online_offline_gen.append(online.el());
  }

  setOffline() {
    this.online_offline_gen.innerHTML = "";
    const offline = new OfflineGameGen(this.submit_callback);
    this.online_offline_gen.append(offline.el());
  }

  constructor(cred_mgr, submit_callback, sign_up_modal) {
    const { base, online_sel, online_offline_gen } =
      GameGen.createElements(cred_mgr);
    super(base);

    this.online_offline_gen = online_offline_gen;

    this.cred_mgr = cred_mgr;
    this.submit_callback = submit_callback;

    if (online_sel.selected === "online") {
      this.setOnline(sign_up_modal);
    } else {
      this.setOffline();
    }

    online_sel.addOnChange((val) => {
      if (val === "online") {
        this.setOnline(sign_up_modal);
      } else {
        this.setOffline();
      }
    })
  }
}
