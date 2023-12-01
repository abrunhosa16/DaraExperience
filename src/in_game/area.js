import Component from "../component.js";
import { PIECE } from "./board.js";
import DropPhaseArea from "./drop_phase/area.js";
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

    const stage = new gameStage(options.width, options.height);

    let starting_turn;
    if (options.starting_color === COLOR.RANDOM) {
      starting_turn = Math.random() < 0.5 ? PIECE.BLACK : PIECE.WHITE;
    } else {
      starting_turn =
        options.starting_color === COLOR.BLACK ? PIECE.BLACK : PIECE.WHITE;
    }
    const drop_area = new DropPhaseArea(stage, {
      width: options.width,
      height: options.height,
      starting_turn: starting_turn,
      black_mode: options.black_mode,
      white_mode: options.white_mode,
      skip_drop_phase: options.skip_drop_phase,
    });

    super(drop_area.el());

    stage
      .load(options.black_piece_type, options.white_piece_type)
      .then(() => {
        return drop_area.start();
      })
      .then(() => {
        console.log("move phase");
      });
  }
}
