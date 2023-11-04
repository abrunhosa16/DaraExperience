export default class ResetButton {
  constructor(onClick) {
    this.target = document.createElement("button");
    this.target.innerHTML = "T̴̢̺̈ ̸̟̱͌͛h̷͉̐̉ ̴̆͝ͅi̶̡͓̾ ̵̰͌s̷̛͈͠ ̷̨̙͗ ̶̹͖̌̃ ̸͙̒w̸̰̫̒ ̷͖͑͊a̵̬̰̓ ̴̬̓s̵̱͂̂ ̷̧́ͅ ̶̗͕̀ ̵̝̚a̵̟͋̅ ̷̰̞̈́ ̸͎̐́͜ ̷̪̩͘m̵͉͗͊ ̶̨̱̔i̸̛̻ ̵̘͝s̵̪̈̓ ̵̡̘̍t̵̙̔ ̷̨͇̈́̾ȃ̸̯̟ ̶̙̝̀k̸̨̮̍̕ ̷̡̡̓́e̷̻͗";
    this.target.addEventListener("click", onClick);
  }

  el() {
    return this.target;
  }
}
