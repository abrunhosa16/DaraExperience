import BoardSizeInput from "./board/board_gen/size_input.js";
import Component from "./component.js";
import { createRanking } from "./ranking.js";
import { getRanking } from "./request_ranking.js";

export default class rankingArea extends Component {
  static createElements() {
    const button = new BoardSizeInput();
    const submit_button = document.createElement("button");
    submit_button.innerHTML = "Submit!";
    const table = document.createElement("div");

    const div_area = document.createElement("div");

    div_area.append(button.el(), submit_button, table);
    return { button, submit_button, div_area, table };
  }

  constructor() {
    const { button, submit_button, div_area, table } =
      rankingArea.createElements();
    super(div_area);
    this.submit_button = submit_button;
    this.button = button;

    this.button.set_error_update_callback((err_count) => {
      this.error_count = err_count;
      if (this.error_count > 0) {
        submit_button.disabled = true;
      } else {
        submit_button.disabled = false;
      }
    });

    submit_button.addEventListener("click", (e) => {
      const [rows, columns] = button.getParsedSize();
      console.log(rows, columns);
      getRanking(rows, columns)
        .then((data) => {
          const el = createRanking(data);
          table.innerHTML = "";
          table.appendChild(el);
        })
        .catch(() => {
          console.log("Invalid");
        });
    });
  }
}

