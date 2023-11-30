import Component from "../component.js";
import { PIECE } from "./board.js";
import DropPhaseGame from "./drop_phase_game.js";
import gameStage from "./stage.js";

export const GAME_MODE = {
  MANUAL: "manual",
  RANDOM: "random",
  MINIMAX: "minimax",
  ONLINE: "online",
};

export const COLOR = {
  BLACK: "black",
  WHITE: "white",
  RANDOM: "random",
};

export const PIECE_TYPE = {
  COIN: "coin",
  LEAF: "leaf",
  ROCK: "rock",
};

export default class InGameArea extends Component {
  // options:
  //    width: width of the board in cells
  //    height: height of the board in cells
  //    black_mode: black player GAME_MODE
  //    white_mode: white player GAME_MODE
  //    black_piece_type: PIECE_TYPE
  //    white_piece_type: PIECE_TYPE
  //  If playing offline:
  //    starting_color: COLOR
  //    skip_drop_phase: bool (places pieces in drop phase randomly)

  constructor(options) {
    console.log(options);

    const base = document.createElement("div");

    const title = document.createElement("h3");
    title.innerHTML = "Hello I am the game";
    base.appendChild(title);

    const stage = new gameStage(options.width, options.height);
    base.appendChild(stage.el());

    super(base);

    let starting_turn;
    if (options.starting_color === COLOR.RANDOM) {
      starting_turn = Math.random() < 0.5 ? PIECE.BLACK : PIECE.WHITE;
    } else {
      starting_turn =
        options.starting_color === COLOR.BLACK ? PIECE.BLACK : PIECE.WHITE;
    }

    this.black_mode = options.black_mode;
    this.white_mode = options.white_mode;
    this.skip_drop_phase = options.skip_drop_phase;

    this.stage = stage;
    this.game = new DropPhaseGame(options.width, options.height, starting_turn);

    // stores the function that highlights a cell if its hovered and
    // it is a valid play
    this.valid_cell_hover = null;
    this._hovered = null;

    this.stage
      .load(options.black_piece_type, options.white_piece_type)
      .then(() => {
        this.start();
      });
  }

  // wait for a click in the stage
  async stageClick() {
    return new Promise((resolve, reject) => {
      const ctx = this.stage.addOnClick((res) => {
        if (res !== null) {
          this.stage.removeOnClick(ctx);
          resolve(res);
        }
      });
    });
  }

  get hovered() {
    return this._hovered;
  }

  set hovered(val) {
    if (this.hovered !== null) {
      this.stage.eraseCellHover(...this.hovered);
    }
    this._hovered = val;
    if (val !== null) {
      this.stage.drawCellHover(...val);
    }
  }

  addCellHover() {
    this.valid_cell_hover = (cell) => {
      console.log(cell);
      if (cell !== null) {
        const [x, y] = cell;
        if (this.game.validPlay(x, y)) {
          this.hovered = cell;
        } else {
          this.hovered = null;
        }
      }
    };
    this.stage.addHoveredCellOnchange(this.valid_cell_hover);
  }

  removeCellHover() {
    if (this.valid_cell_hover !== null) {
      this.hovered = null;
      this.stage.removeHoveredCellOnchange(this.valid_cell_hover);
    }
  }

  async start() {
    while (true) {
      const turn = this.game.turn;
      const cur_mode = this.skip_drop_phase
        ? GAME_MODE.RANDOM
        : turn === PIECE.BLACK
        ? this.black_mode
        : this.white_mode;

      let x, y;
      let phase_ended;
      switch (cur_mode) {
        case GAME_MODE.MANUAL:
          this.stage.clearHighlighted();
          const current_invalid = this.game.getCurrentInvalid();
          const other_invalid = this.game.getOtherInvalid();
          this.stage.highlight(current_invalid, "#aa0000");
          this.stage.highlight(other_invalid, "#0000aa");

          this.addCellHover();
          [x, y] = await this.stageClick();
          this.removeCellHover();

          try {
            phase_ended = this.game.play(x, y);
          } catch (err) {
            console.log(err);
            continue;
          }
          break;

        case GAME_MODE.RANDOM:
          const move_list = this.game.getMoveList();
          const i = Math.floor(Math.random() * move_list.length);
          [x, y] = move_list[i];

          phase_ended = this.game.play(x, y);
          break;

        default:
          throw new Error("Unimplemented!");
      }

      if (turn === PIECE.BLACK) {
        this.stage.drawBlackPiece(x, y);
      } else {
        this.stage.drawWhitePiece(x, y);
      }

      if (phase_ended) {
        break;
      }
    }
  }
}
