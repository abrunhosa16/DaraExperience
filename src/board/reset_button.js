import Component from "../component.js";

export default class ResetButton extends Component {
  constructor(onClick) {
    super(document.createElement("button"))

    super.el().innerHTML = "T̴̢̺̈ ̸̟̱͌͛h̷͉̐̉ ̴̆͝ͅi̶̡͓̾ ̵̰͌s̷̛͈͠ ̷̨̙͗ ̶̹͖̌̃ ̸͙̒w̸̰̫̒ ̷͖͑͊a̵̬̰̓ ̴̬̓s̵̱͂̂ ̷̧́ͅ ̶̗͕̀ ̵̝̚a̵̟͋̅ ̷̰̞̈́ ̸͎̐́͜ ̷̪̩͘m̵͉͗͊ ̶̨̱̔i̸̛̻ ̵̘͝s̵̪̈̓ ̵̡̘̍t̵̙̔ ̷̨͇̈́̾ȃ̸̯̟ ̶̙̝̀k̸̨̮̍̕ ̷̡̡̓́e̷̻͗";
    super.el().addEventListener("click", onClick);
  }
}
