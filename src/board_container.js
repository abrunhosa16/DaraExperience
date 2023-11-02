import { Board } from "./board_game.js";


const ROW_ID = "b-row";
const CELL_ID = "b-cell";
const INVALID_FLASH_TIME = 1000;

const paintFizz = (cell) => {
  cell.classList.add("fizz");
}

const paintBuzz = (cell) => {
  cell.classList.add("buzz");
}

export class BoardContainer {
  constructor(board_el, configs) {
    console.log("configs", configs);

    this._hovered = null;  // HTMLElement | null
    this._invalid_flash = null;  // {cell: HTMLElement, timeout_id: number} | null
    this.board_el = board_el;  // HTMLElement
    this.black_invalid = []  // [(number, number)]
    this.white_invalid = []  // [(number, number)]

    BoardContainer.generateBoard(board_el, configs);

    this.board = new Board(configs);
    const drop_phase_on_click = this.getDropPhaseOnClick();
    board_el.addEventListener("click", drop_phase_on_click);

    const on_mouse_over = this.getOnMouseOver();
    board_el.addEventListener("mouseover", on_mouse_over);
  }

  set hovered(cell) {
    // unset previous cell
    if (this._hovered !== null) {
      if (cell !== null && this._hovered.id === cell.id) {
        return;
      }
      this._hovered.classList.remove("hovered");
    }

    // test if cell is null or cannot be set
    if (cell === null || this.invalid_flash?.cell?.id === cell.id) {
      this._hovered = null;
      return;
    }

    cell.classList.add("hovered");
    this._hovered = cell;
  }

  get hovered() {
    return this._hovered;
  }

  static isBoardCell(cell) {
    return cell.id.startsWith(CELL_ID);
  }

  static getBoardCell(x, y) {
    return document.getElementById(`${CELL_ID}-${y}-${x}`);
  }

  static getCoorsFromId(id) {
    const sliced = id.slice(CELL_ID.length + 1);
    const sep_i = sliced.indexOf("-");
    const y = parseInt(sliced.slice(0, sep_i));
    const x = parseInt(sliced.slice(sep_i + 1));
    return [x, y];
  };

  set invalid_flash(cell) {
    if (this._invalid_flash !== null) {
      // if selected cell is already invalid
      if (cell && this._invalid_flash.cell.id === cell.id) {
        return;
      }

      // clear previous invalid
      clearTimeout(this._invalid_flash.timeout_id);
      this._invalid_flash.cell.classList.remove("invalid-flash");
      this._invalid_flash = null;
    }

    if (cell === null) {
      return;
    }

    // remove hovered status
    if (this.hovered && this.hovered.id === cell.id) {
      this.hovered = null;
    }

    cell.classList.add("invalid-flash");
    // set timeout to clear invalid
    const timeout_id = setTimeout(() => {
      this.invalid_flash = null;
    }, INVALID_FLASH_TIME);

    this._invalid_flash = {
      cell: cell,
      timeout_id: timeout_id
    };
  }

  get invalid_flash() {
    return this._invalid_flash ? this._invalid_flash.cell : null;
  }

  static generateBoard(board_el, configs) {
    // expects board to be a table containing a tbody
    const body = board_el.children[0];
    const rows = [];
    for (let i = 0; i < configs.height; i++) {
      const row = document.createElement("tr");
      row.id = `${ROW_ID}-${i}`;
      const cells = [];

      for (let j = 0; j < configs.width; j++) {
        const cell = document.createElement("td");
        cell.id = `${CELL_ID}-${i}-${j}`;
        if ((i + j) % 2 === 0) {
          paintFizz(cell);
        } else {
          paintBuzz(cell);
        }

        cells.push(cell);
      }

      row.replaceChildren(...cells);
      rows.push(row);
    }

    body.replaceChildren(...rows);
  }

  initializeMovePhase() {
    console.log("INITIALIZE MOVE PHASE");
    this.board_el.innerHTML = "<h1>\"Here I stand, reduced to a mere quote\"</h1>";
  }

  getDropPhaseOnClick() {
    return (e) => {
      const cell = e.target;
      if (!BoardContainer.isBoardCell(cell)) {
        return;
      }
      this.invalid_flash = null;

      const [x, y] = BoardContainer.getCoorsFromId(e.target.id);

      const cur_turn_black = this.board.black_turn;
      let results;
      try {
        // returns true if drop phase has finished, false if just succeeded
        results = this.board.playDropPhase(x, y);
      } catch (err) {
        console.log(err);
        this.invalid_flash = cell;
        // TODO: the message should appear to the user as a notification
        console.log(err.message);
        return;
      }

      if (results.phase_ended) {
        this.initializeMovePhase();
        return;
      } else {
        const image = document.createElement("img");
        if (cur_turn_black) {
          image.src = "./iconesDara/coin/black_coin.png";
        } else {
          image.src = "./iconesDara/coin/white_coin.png";
        }
        cell.appendChild(image);
        cell.classList.add("filled");
      }

      const [invalid, other_invalid] = cur_turn_black ? [this.black_invalid, this.white_invalid] : [this.white_invalid, this.black_invalid];

      // remove classes
      invalid.forEach(([x_c, y_c]) => {
        BoardContainer.getBoardCell(x_c, y_c).classList.remove("invalid");
      });
      other_invalid.forEach(([x_c, y_c]) => {
        BoardContainer.getBoardCell(x_c, y_c).classList.remove("invalid-other");
      });

      // test if the current move was played on other invalid
      const other_i = other_invalid.findIndex(([x_c, y_c]) => x === x_c && y === y_c);
      if (other_i !== -1) {
        // if so remove
        other_invalid.splice(other_i, 1);
      }

      // add new invalids
      invalid.push(...results.new_invalid);

      // add classes back (this time reversed)
      invalid.forEach(([x_c, y_c]) => {
        BoardContainer.getBoardCell(x_c, y_c).classList.add("invalid-other");
      });
      other_invalid.forEach(([x_c, y_c]) => {
        BoardContainer.getBoardCell(x_c, y_c).classList.add("invalid");
      });
    }
  }

  getOnMouseOver() {
    return (e) => {
      const cell = e.target;
      if (!BoardContainer.isBoardCell(cell)) {
        return;
      }

      this.hovered = cell;
    }
  }
}
