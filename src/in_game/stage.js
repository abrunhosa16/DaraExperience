import Component from "../component.js";
import { PIECE } from "./board.js";

// target width in pixels
const WIDTH = 400;
// border in pixels BETWEEN cells
const BORDER = 1;

// Percentage of size of a piece relatively of its cell
const PIECE_SIZE = 0.8;

const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

const relativeCoors = (e) => {
  const rect = e.target.getBoundingClientRect();
  return [e.clientX - Math.floor(rect.left), e.clientY - Math.floor(rect.top)];
};

export default class gameStage extends Component {
  static emptyCanvas(class_, width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.className = class_;
    return canvas;
  }

  constructor(options, onClick) {
    console.log(options);

    // cell size with the border
    const cell_size = Math.floor((WIDTH + BORDER) / options.width);
    // total width and height of the board (with internal borders);
    const width = cell_size * options.width - BORDER;
    const height = cell_size * options.height - BORDER;

    // contains just the game background
    // remains static trough the game
    const background = gameStage.emptyCanvas("background", width, height);
    // contains highlighted valid and invalid positions
    const highlighted = gameStage.emptyCanvas("highlighted", width, height);
    // contains current game pieces
    const pieces = gameStage.emptyCanvas("pieces", width, height);
    // its drawn over to show hovered or invalid cells
    const hovered = gameStage.emptyCanvas("hovered", width, height);

    const base = document.createElement("div");
    base.classList.add("stage");
    base.style.width = `${width}px`;
    base.style.height = `${height}px`;
    base.append(background, highlighted, pieces, hovered);

    super(base);

    this.x_count = options.width;
    this.y_count = options.height;

    this.cell_size = cell_size;
    this.width = width;
    this.height = height;

    this.background = background;
    this.highlighted = highlighted;
    this.pieces = pieces;
    this.hovered = hovered;

    // black and white will contain images when they load
    this.black = undefined;
    this.white = undefined;
    this.piece_size = Math.floor(cell_size * PIECE_SIZE);
    this.piece_margin = Math.floor(cell_size * ((1 - PIECE_SIZE) / 2));

    // this.hovered_cell is just a internal variable representing the cell
    // on which the mouse is over
    this.hovered_cell = null;
    this.hovered_cell_onchange_callbacks = new Set();
    base.addEventListener("mousemove", (e) => {
      const [x, y] = relativeCoors(e);
      const n = this.coorsFromPosition(x, y);

      const l_null = this.hovered_cell === null;
      const n_null = n === null;
      // if at least one of them is not null
      if (!l_null || !n_null) {
        // if one of them is null or they are not equal
        if (
          l_null ||
          n_null ||
          this.hovered_cell[0] !== n[0] ||
          this.hovered_cell[1] !== n[1]
        ) {
          this.hovered_cell = n;
          this.hovered_cell_onchange_callbacks.forEach((func) => {
            func(n);
          });
        }
      }
    });

    this.redrawBackground();
  }

  // adds a function thats going to be called when the cell under the mouse changes
  addHoveredCellOnchange(callback) {
    this.hovered_cell_onchange_callbacks.add(callback);
  }

  removeHoveredCellOnchange(callback) {
    this.hovered_cell_onchange_callbacks.delete(callback);
  }

  // gets coordinates from some relative position on the board.
  // can return null if the position is on a internal border
  coorsFromPosition(x_offset, y_offset) {
    const x = Math.floor(x_offset / this.cell_size);
    const y = Math.floor(y_offset / this.cell_size);

    // test if coors are on some border
    if (
      x_offset % this.cell_size >= this.cell_size - BORDER ||
      y_offset % this.cell_size >= this.cell_size - BORDER
    ) {
      return null;
    }
    return [x, y];
  }

  // adds a function that runs if some cell is clicked
  addOnClick(func) {
    const with_context = (e) => {
      func(this.hovered_cell);
    };
    super.el().addEventListener("click", with_context);
    return with_context;
  }

  // removes the function that was returned above
  removeOnClick(ctx_func) {
    super.el().removeEventListener("click", ctx_func);
  }

  // loads the specific images for the black and white pieces
  async load(black_piece, white_piece) {
    // black and white started loading in parallel
    const black = loadImage(
      `./public/playable_pieces/${black_piece}/black.png`
    );
    const white = loadImage(
      `./public/playable_pieces/${white_piece}/white.png`
    );

    this.black = await black;
    this.white = await white;
  }

  // draws the background with all the internal borders
  redrawBackground() {
    const ctx = this.background.getContext("2d");
    ctx.fillRect(0, 0, this.width, this.height);

    const double = this.cell_size + this.cell_size;
    const cropped = this.cell_size - BORDER;

    ctx.fillStyle = "#e28e51";
    for (let y = 0; y < this.height; y += double) {
      for (let x = 0; x < this.width; x += double) {
        ctx.fillRect(x, y, cropped, cropped);
      }
    }
    for (let y = this.cell_size; y < this.height; y += double) {
      for (let x = this.cell_size; x < this.width; x += double) {
        ctx.fillRect(x, y, cropped, cropped);
      }
    }

    ctx.fillStyle = "#e7e0db";
    for (let y = 0; y < this.height; y += double) {
      for (let x = this.cell_size; x < this.width; x += double) {
        ctx.fillRect(x, y, cropped, cropped);
      }
    }
    for (let y = this.cell_size; y < this.height; y += double) {
      for (let x = 0; x < this.width; x += double) {
        ctx.fillRect(x, y, cropped, cropped);
      }
    }
  }

  // draws a black piece
  drawBlackPiece(x, y) {
    const ctx = this.pieces.getContext("2d");
    ctx.drawImage(
      this.black,
      this.piece_margin + x * this.cell_size,
      this.piece_margin + y * this.cell_size,
      this.piece_size,
      this.piece_size
    );
  }

  // draws a white piece
  drawWhitePiece(x, y) {
    const ctx = this.pieces.getContext("2d");
    ctx.drawImage(
      this.white,
      this.piece_margin + x * this.cell_size,
      this.piece_margin + y * this.cell_size,
      this.piece_size,
      this.piece_size
    );
  }

  // erases a piece
  erasePiece(x, y) {
    const ctx = this.pieces.getContext("2d");
    ctx.clearRect(
      x * this.cell_size,
      y * this.cell_size,
      this.cell_size,
      this.cell_size
    );
  }

  // set current coordinates to the specific piece
  setPiece(x, y, piece) {
    this.erasePiece(x, y);
    switch (piece) {
      case PIECE.BLACK:
        this.drawBlackPiece(x, y);
        break;
      case PIECE.WHITE:
        this.drawWhitePiece(x, y);
        break;
      default:
        throw new Error("Invalid piece type when drawing");
    }
  }

  drawPieces(board) {
    const ctx = this.pieces.getContext("2d");
    ctx.clearRect(0, 0, this.width, this.height);

    let x_offset = this.piece_margin;
    let y_offset = this.piece_margin;
    for (let y = 0; y < this.y_count; y += 1) {
      x_offset = this.piece_margin;
      for (let x = 0; x < this.x_count; x += 1) {
        const piece = board[y][x];
        if (piece != PIECE.NOTHING) {
          const img = piece === PIECE.BLACK ? this.black : this.white;
          ctx.drawImage(
            img,
            x_offset,
            y_offset,
            this.piece_size,
            this.piece_size
          );
        }
        x_offset += this.cell_size;
      }
      y_offset += this.cell_size;
    }
  }

  // highlight the given positions with the given color
  // (draws over other highlighted positions)
  highlight(positions, color) {
    const ctx = this.highlighted.getContext("2d");
    ctx.fillStyle = color;

    positions.forEach(([x, y]) => {
      const cropped = this.cell_size - BORDER;
      ctx.fillRect(x * this.cell_size, y * this.cell_size, cropped, cropped);
    });
  }

  clearHighlighted() {
    const ctx = this.highlighted.getContext("2d");
    ctx.clearRect(0, 0, this.width, this.height);
  }

  drawCellHover(x, y) {
    const ctx = this.hovered.getContext("2d");
    ctx.fillStyle = "#000000bb";
    const cropped = this.cell_size - BORDER;
    ctx.fillRect(
      x * this.cell_size,
      y * this.cell_size,
      cropped,
      cropped
    );
  }

  eraseCellHover(x, y) {
    const ctx = this.hovered.getContext("2d");
    const cropped = this.cell_size - BORDER;
    ctx.clearRect(
      x * this.cell_size,
      y * this.cell_size,
      cropped,
      cropped
    );
  }
}
