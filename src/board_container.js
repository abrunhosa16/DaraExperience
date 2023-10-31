import {Board} from "./board_game.js";


const ROW_ID = "b-row";
const CELL_ID = "b-cell";
const INVALID_FLASH_TIME = 1000;

const paintOrange = (cell) => {
  cell.classList.add("orange");
}

const paintBeige = (cell) => {
  cell.classList.add("beige");
}

export class BoardContainer {
  constructor(board_el, configs) {
    console.log("configs", configs);

    this._hovered = null;  // HTMLElement | null
    this._invalid = null;  // {cell: HTMLElement, timeout_id: number} | null
    this.board_el = board_el;  // HTMLElement

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
    if (cell === null || this.invalid?.cell?.id === cell.id) {
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

  static getCoorsFromId(id) {
    const sliced = id.slice(CELL_ID.length + 1);
    const sep_i = sliced.indexOf("-");
    const y = parseInt(sliced.slice(0, sep_i));
    const x = parseInt(sliced.slice(sep_i + 1));
    return [x, y];
  };

  set invalid(cell) {
    if (this._invalid !== null) {
      // if selected cell is already invalid
      if (cell && this._invalid.cell.id === cell.id) {
        return;
      }

      // clear previous invalid
      clearTimeout(this._invalid.timeout_id);
      this._invalid.cell.classList.remove("invalid");
      this._invalid = null;
    }

    if (cell === null) {
      return;
    }

    // remove hovered status
    if (this.hovered && this.hovered.id === cell.id) {
      this.hovered = null;
    }
  
    cell.classList.add("invalid");
    // set timeout to clear invalid
    const timeout_id = setTimeout(() => {
      this.invalid = null;
    }, INVALID_FLASH_TIME);
    
    this._invalid = {
      cell: cell,
      timeout_id: timeout_id
    };
  }

  get invalid() {
    return this._invalid ? this._invalid.cell : null;
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
          paintOrange(cell);
        } else {
          paintBeige(cell);
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
  }

  getDropPhaseOnClick() {
    return (e) => {
      const cell = e.target;
      if (!BoardContainer.isBoardCell(cell)) {
        return;
      }
      const [x, y] = BoardContainer.getCoorsFromId(e.target.id);
  
      let turn, drop_phase_ended;
      try {
        // returns true if drop phase has finished, false if just succeeded
        [turn, drop_phase_ended] = this.board.playDropPhase(x, y);
      } catch (err) {
        this.invalid = cell;
        // TODO: the message should appear to the user as a notification
        console.log(err.message);
        return;
      }

      console.log(turn, drop_phase_ended);
      if (drop_phase_ended) {
        this.initializeMovePhase();
      } else {
        e.target.innerHTML = turn ? 'B' : 'W';
      }
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
