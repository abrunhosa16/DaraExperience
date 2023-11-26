
import Component from "../component.js";

export default class InGameArea extends Component {
  constructor(options) {
    console.log(options);

    const base = document.createElement("div");

    const title = document.createElement("h3");
    title.innerHTML = "Hello I am the game";
    base.appendChild(title);

    const game = document.createElement("canvas");
    game.width = 400;
    game.height = 400;

    const ctx = game.getContext("2d");
    ctx.fillRect(25, 25, 100, 100);

    base.appendChild(game);

    super(base);
  }
}
