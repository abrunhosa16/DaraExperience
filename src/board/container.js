import Component from "../component.js";
import { DropBoard, MoveBoard, adjacent } from "./game.js";

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
  static generateBoard(config) {
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

    let cell_matrix = [];
    const rows = [];
    for (let i = 0; i < config.height; i++) {
      const row = document.createElement("tr");
      row.id = `${ROW_ID}-${i}`;
      const cells = [];

      for (let j = 0; j < config.width; j++) {
        const cell = document.createElement("td");
        cell.id = `${CELL_ID}-${i}-${j}`;
        if ((i + j) % 2 === 0) {
          paintFizz(cell);
        } else {
          paintBuzz(cell);
        }

        const content = document.createElement("div");
        content.classList.add("board-content");

        const hoverblock = document.createElement("div");
        hoverblock.classList.add("board-hoverblock");

        const selectable = document.createElement("div");
        selectable.classList.add("board-selectable");

        cell.append(content, hoverblock, selectable);

        cells.push(cell);
      }

      cell_matrix.push(cells);
      row.replaceChildren(...cells);
      rows.push(row);
    }

    body.replaceChildren(...rows);

    return { target: target, cells: cell_matrix };
  }

  // callbacks
  // phaseChange: (phase: string) => void;
  // invalidMessage: (message: string) => void;
  // turn: (turn: string) => void;
  constructor(config, callbacks) {
    const { target, cells } = BoardContainer.generateBoard(config);
    super(target);

    this.cells = cells;

    console.log("config", config);

    this.config = config;

    this.callbacks = callbacks;

    this._hovered = null; // HTMLElement | null
    this._invalid_flash = null; // {cell: HTMLElement, timeout_id: number} | null
    this._selected = null; // HTMLElement | null
    this.eventListeners = {};

    this.black_invalid = []; // [(number, number)]
    this.white_invalid = []; // [(number, number)]

    this.board = new DropBoard(config);

    const images = this.createImages();
    this.black_image = images[0];
    this.white_image = images[1];

    this.initializeDropPhase();
  }

  static isBoardCell(cell) {
    return cell.id.startsWith(CELL_ID);
  }

  createImages() {
    const black = document.createElement("img");
    black.src = `./playable_pieces/${this.config.black_piece_type}/black.png`;
    const white = document.createElement("img");
    white.src = `./playable_pieces/${this.config.white_piece_type}/white.png`;

    return [black, white];
  }

  getImage(black_turn) {
    return (black_turn ? this.black_image : this.white_image).cloneNode();
  }

  getBoardCell(x, y) {
    return this.cells[y][x];
  }

  static getCoorsFromId(id) {
    const sliced = id.slice(CELL_ID.length + 1);
    const sep_i = sliced.indexOf("-");
    const y = parseInt(sliced.slice(0, sep_i));
    const x = parseInt(sliced.slice(sep_i + 1));
    return [x, y];
  }

  initializeDropPhase() {
    this.callbacks.phaseChange("Drop");
    this.callbacks.turn(this.board.getCurrentTurn());

    if (this.config.skip_drop_phase) {
      while (true) {
        const cur_turn_black = this.board.isTurnBlack();
        const { phase_ended, x, y } = this.board.playRandomly();

        const cell = this.getBoardCell(x, y);
        cell.childNodes[0].appendChild(this.getImage(cur_turn_black));

        if (phase_ended) {
          this.initializeMovePhase();
          console.log(this.board);
          return;
        }
      }
    } else {
      this.addEventListener(
        "drop_phase_on_click",
        "click",
        this.getDropPhaseOnClick()
      );
      this.addEventListener(
        "drop_phase_on_mouse_over",
        "mouseover",
        this.getDropPhaseOnMouseOver()
      );
    }
  }

  initializeMovePhase() {
    this.callbacks.phaseChange("Move");

    this.board = new MoveBoard(this.config, this.board);

    console.log("what");
    this.addEventListener(
      "move_phase_on_click",
      "click",
      this.getMovePhaseOnClick()
    );
    console.log("yay", this);
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
      this._hovered.childNodes[1].innerHTML = "";
      this._hovered.classList.remove("hovered-valid");
      this._hovered.classList.remove("hovered-invalid");
    }

    // test if cell is null or cannot be set
    if (cell === null || this.invalid_flash?.cell?.id === cell.id) {
      this._hovered = null;
      return;
    }

    if (this.board.validPlay(...BoardContainer.getCoorsFromId(cell.id))) {
      cell.classList.add("hovered-valid");
    } else {
      cell.classList.add("hovered-invalid");
    }

    cell.childNodes[1].appendChild(this.getImage(this.board.isTurnBlack()));

    this._hovered = cell;
  }

  get hovered() {
    return this._hovered;
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
      this.callbacks.invalidMessage(null);
    }

    if (cell === null) {
      return;
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
    this.callbacks.invalidMessage(message);
  }

  get invalid_flash() {
    return this._invalid_flash ? this._invalid_flash.cell : null;
  }

  get selected() {
    return this._selected ? this._selected.cell : null;
  }

  set selected(cell) {
    // unset previous cell
    if (this._selected !== null) {
      const { cell, playable } = this._selected;
      cell.classList.remove("selected");
      playable.forEach((el) => {
        el.classList.remove("selected-playable");
      });
    }

    if (cell === null) {
      this._selected = null;
      return;
    }

    const [x, y] = BoardContainer.getCoorsFromId(cell.id);
    cell.classList.add("selected");

    const playable = [];
    if (this.board.canMoveUp(x, y)) {
      const cell = this.getBoardCell(x, y - 1);
      cell.classList.add("selected-playable");
      playable.push(cell);
    }
    if (this.board.canMoveDown(x, y)) {
      const cell = this.getBoardCell(x, y + 1);
      cell.classList.add("selected-playable");
      playable.push(cell);
    }
    if (this.board.canMoveLeft(x, y)) {
      const cell = this.getBoardCell(x - 1, y);
      cell.classList.add("selected-playable");
      playable.push(cell);
    }
    if (this.board.canMoveRight(x, y)) {
      const cell = this.getBoardCell(x + 1, y);
      cell.classList.add("selected-playable");
      playable.push(cell);
    }
    console.log(playable);

    this._selected = { cell: cell, playable: playable };
  }

  getDropPhaseOnClick() {
    return (e) => {
      const cell = e.target.parentElement;
      if (!BoardContainer.isBoardCell(cell)) {
        return;
      }
      this.invalid_flash = null;

      const [x, y] = BoardContainer.getCoorsFromId(cell.id);

      const cur_turn_black = this.board.isTurnBlack();
      let results;
      try {
        // returns true if drop phase has finished, false if just succeeded
        results = this.board.play(x, y);
      } catch (err) {
        console.log(err);
        this.invalid_flash = { cell: cell, message: err.message };
        console.log(err.message);
        return;
      }

      this.invalid_flash = null;
      this.hovered = null;

      const [invalid, other_invalid] = cur_turn_black
        ? [this.black_invalid, this.white_invalid]
        : [this.white_invalid, this.black_invalid];

      // remove classes
      invalid.forEach(([x_c, y_c]) => {
        this.getBoardCell(x_c, y_c).classList.remove("invalid");
      });
      other_invalid.forEach(([x_c, y_c]) => {
        this.getBoardCell(x_c, y_c).classList.remove("invalid-other");
      });

      cell.childNodes[0].appendChild(this.getImage(cur_turn_black));

      this.callbacks.turn(this.board.getCurrentTurn());

      if (results.phase_ended) {
        this.removeEventListener("drop_phase_on_click");
        this.removeEventListener("drop_phase_on_mouse_over");
        this.initializeMovePhase();
        return;
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
        this.getBoardCell(x_c, y_c).classList.add("invalid-other");
      });
      other_invalid.forEach(([x_c, y_c]) => {
        this.getBoardCell(x_c, y_c).classList.add("invalid");
      });
    };
  }

  getMovePhaseOnClick() {
    return (e) => {
      const cell = e.target.parentElement;
      if (!BoardContainer.isBoardCell(cell)) {
        return;
      }

      const [x, y] = BoardContainer.getCoorsFromId(cell.id);

      if (this.selected !== null) {
        const [xi, yi] = BoardContainer.getCoorsFromId(this.selected.id);
        if (
          this.board.empty(x, y) &&
          adjacent(xi, yi, x, y)
        ) {
          const cur_turn_black = this.board.isTurnBlack();

          try {
            // returns true if drop phase has finished, false if just succeeded
            console.log("playing from", xi, yi, "to", x, y);
            this.board.play(xi, yi, x, y);
          } catch (err) {
            console.log(err);
            this.invalid_flash = { cell: cell, message: err.message };
            console.log(err.message);
            return;
          }

          this.invalid_flash = null;

          this.selected.childNodes[0].innerHTML = "";
          this.selected = null;

          cell.childNodes[0].appendChild(this.getImage(cur_turn_black));

          this.callbacks.turn(this.board.getCurrentTurn());

        } else {
          this.selected = null;
        }
      } else {
        if (this.board.ally(x, y)) {
          this.selected = cell;
        }
      }
    };
  }

  getDropPhaseOnMouseOver() {
    return (e) => {
      const cell = e.target.parentElement;
      if (!BoardContainer.isBoardCell(cell)) {
        return;
      }

      this.hovered = cell;
    };
  }
}
