import Component from "../component.js";
import { DropBoard } from "./game.js";

const ROW_ID = "b-row";
const CELL_ID = "b-cell";
const INVALID_FLASH_TIME = 2000;

const paintFizz = (cell) => {
  cell.classList.add("fizz");
};

const paintBuzz = (cell) => {
  cell.classList.add("buzz");
};

export class BoardContainer extends Component {
  static generateBoard(configs) {
    /* 
    <table class="board unselectable">
      <tbody> 
        <Rows>
      </tbody>
    </table>
    */

    const target = document.createElement("table");
    target.classList.add("board", "unselectable");

    const body = document.createElement("tbody");
    target.appendChild(body);

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

    return target;
  }

  constructor(configs, phaseChangeCallback, invalidMessageCallback) {
    super(BoardContainer.generateBoard(configs));

    console.log("configs", configs);

    this.phaseChangeCallback = phaseChangeCallback;
    this.invalidMessageCallback = invalidMessageCallback;

    this._hovered = null; // HTMLElement | null
    this._invalid_flash = null; // {cell: HTMLElement, timeout_id: number} | null
    this.eventListeners = {};

    this.black_invalid = []; // [(number, number)]
    this.white_invalid = []; // [(number, number)]

    this.board = new DropBoard(configs);
  }

  start() {
    this.initializeDropPhase();
  }

  initializeDropPhase() {
    this.phaseChangeCallback("Drop");

    this.addEventListener(
      "drop_phase_on_click",
      "click",
      this.getDropPhaseOnClick()
    );
    this.addEventListener("on_mouse_over", "mouseover", this.getOnMouseOver());
  }

  initializeMovePhase() {
    this.phaseChangeCallback("Move");

    this.removeEventListener("drop_phase_on_click");
  }

  addEventListener(name, type, func) {
    this.eventListeners[name] = [type, func];
    super.el().addEventListener(type, func);
  }

  removeEventListener(name) {
    const [type, func] = this.eventListeners[name];
    super.el().removeEventListener(type, func);
    delete this.eventListeners[name];
  }

  removeAllEventListeners() {
    Object.keys(this.eventListeners).forEach((name) => {
      this.removeEventListener(name);
    });
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
  }

  set invalid_flash(obj) {
    const { cell, message } =
      obj === null ? { cell: null, message: null } : obj;

    if (this._invalid_flash !== null) {
      // if selected cell is already invalid
      if (cell && this._invalid_flash.cell.id === cell.id) {
        return;
      }

      // clear previous invalid
      clearTimeout(this._invalid_flash.timeout_id);
      this._invalid_flash.cell.classList.remove("invalid-flash");
      this._invalid_flash = null;
      this.invalidMessageCallback(null);
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
      timeout_id: timeout_id,
    };
    this.invalidMessageCallback(message);
  }

  get invalid_flash() {
    return this._invalid_flash ? this._invalid_flash.cell : null;
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
        this.invalid_flash = {cell: cell, message: err.message};
        console.log(err.message);
        return;
      }

      const [invalid, other_invalid] = cur_turn_black
        ? [this.black_invalid, this.white_invalid]
        : [this.white_invalid, this.black_invalid];

      // remove classes
      invalid.forEach(([x_c, y_c]) => {
        BoardContainer.getBoardCell(x_c, y_c).classList.remove("invalid");
      });
      other_invalid.forEach(([x_c, y_c]) => {
        BoardContainer.getBoardCell(x_c, y_c).classList.remove("invalid-other");
      });

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

      if (results.phase_ended) {
        this.initializeMovePhase();
        return;
      } else {
        cell.innerHTML = cur_turn_black ? "B" : "W";
        cell.classList.add("filled");
      }

      // test if the current move was played on other invalid
      const other_i = other_invalid.findIndex(
        ([x_c, y_c]) => x === x_c && y === y_c
      );
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
    };
  }

  getOnMouseOver() {
    return (e) => {
      const cell = e.target;
      if (!BoardContainer.isBoardCell(cell)) {
        return;
      }

      this.hovered = cell;
    };
  }

  getMovePhaseOnClick() {}
}
