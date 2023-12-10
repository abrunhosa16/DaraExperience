import Component from "../../component.js";
import { GAME_MODE } from "../area.js";
import { PIECE } from "../board.js";
import DropPhaseGame from "./game.js";

export default class DropPhaseArea extends Component {
  static INVALID_COLOR = "#0000aa";
  static INVALID_OTHER_COLOR = "#aa0000";

  constructor(
    stage,
    { width, height, starting_turn, black_mode, white_mode, skip_drop_phase }
  ) {
    const base = document.createElement("div");
    const title = document.createElement("h3");
    title.innerHTML = "Drop phase";
    base.appendChild(title);
    base.appendChild(stage.el());

    super(base);

    this.stage = stage;

    this.black_mode = black_mode;
    this.white_mode = white_mode;
    this.skip_drop_phase = skip_drop_phase;

    this.game = new DropPhaseGame(width, height, starting_turn);

    // current hovered cell coors
    this.hovered = null;
    // paint hovered cell with a different shade if its a valid play
    this.test_for_validity = false;
  }

  // wait for a click in the stage
  async validPlayStageClick() {
    return new Promise((resolve, reject) => {
      const ctx = this.stage.addOnClick((res) => {
        if (res !== null) {
          this.stage.removeOnClick(ctx);
          resolve(res);
        }
      });
    });
  }

  // paints a cell to be hovered
  set_hovered(val) {
    if (this.hovered !== null) {
      this.stage.eraseCellHover(...this.hovered);
    }

    if (val === null) {
      this.hovered = null;
    } else {
      const { x, y, color } = val;
      this.hovered = [x, y];
      this.stage.drawCellHover(x, y, color);
    }
  }

  // adds an event that hovers a cell if its a valid play
  // returns a function that removes the event when called
  addCellHover() {
    const callback = (cell) => {
      if (cell === null) {
        this.set_hovered(null);
      } else {
        const [x, y] = cell;
        if (this.test_for_validity && this.game.validPlay(x, y)) {
          this.set_hovered({ x: x, y: y, color: "#000000bb" });
        } else {
          this.set_hovered({ x: x, y: y, color: "#00000017" });
        }
      }
    };
    callback(this.stage.getHoveredCell());
    this.stage.addHoveredCellOnchange(callback);

    return {
      remove: () => {
        this.set_hovered(null);
        this.stage.removeHoveredCellOnchange(callback);
      },
      redraw: () => {
        callback(this.stage.getHoveredCell());
      },
    };
  }

  paintInvalid() {
    this.stage.clearHighlighted();
    this.stage.highlight(
      this.game.getOtherInvalid(),
      DropPhaseArea.INVALID_COLOR
    );
    this.stage.highlight(
      this.game.getCurrentInvalid(),
      DropPhaseArea.INVALID_OTHER_COLOR
    );
  }

  paintInvalidInverse() {
    this.stage.clearHighlighted();
    this.stage.highlight(
      this.game.getCurrentInvalid(),
      DropPhaseArea.INVALID_COLOR
    );
    this.stage.highlight(
      this.game.getOtherInvalid(),
      DropPhaseArea.INVALID_OTHER_COLOR
    );
  }

  async start() {
    if (this.skip_drop_phase) {
      while (true) {
        const turn = this.game.turn;
        const { phase_ended, move } = this.game.playRandomMove();
        if (turn === PIECE.BLACK) {
          this.stage.drawBlackPiece(...move);
        } else {
          this.stage.drawWhitePiece(...move);
        }
        if (phase_ended) {
          return this.game;
        }
      }
    }

    const hover = this.addCellHover();
    while (true) {
      const turn = this.game.turn;
      const cur_mode = turn === PIECE.BLACK ? this.black_mode : this.white_mode;

      let x, y;
      let phase_ended;
      switch (cur_mode) {
        case GAME_MODE.MANUAL:
          this.paintInvalid();

          this.test_for_validity = true;
          hover.redraw();
          [x, y] = await this.validPlayStageClick();
          this.test_for_validity = false;
          hover.redraw();

          try {
            phase_ended = this.game.play(x, y);
          } catch (err) {
            console.log(err);
            continue;
          }

          break;

        case GAME_MODE.RANDOM:
          this.paintInvalidInverse();
          // wait so that the play isn't instantaneous
          // todo: add animation
          await new Promise((resolve) => setTimeout(resolve, 100));
          const res = this.game.playRandomMove();
          phase_ended = res.phase_ended;
          [x, y] = res.move;
          break;

        default:
          throw new Error("Unimplemented!");
      }

      if (turn === PIECE.BLACK) {
        console.log("placed black", x, y);
        this.stage.drawBlackPiece(x, y);
      } else {
        console.log("placed white", x, y);
        this.stage.drawWhitePiece(x, y);
      }

      if (phase_ended) {
        break;
      }
    }

    hover.remove();
    this.stage.clearHighlighted();

    return this.game;
  }
}
