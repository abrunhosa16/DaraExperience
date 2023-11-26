
import Component from "../component.js";
import gameStage from "./stage.js";

export default class InGameArea extends Component {
  constructor(options) {
    console.log(options);

    const base = document.createElement("div");

    const title = document.createElement("h3");
    title.innerHTML = "Hello I am the game";
    base.appendChild(title);

    const stage = new gameStage(options);
    base.appendChild(stage.el());

    super(base);
  }
}
