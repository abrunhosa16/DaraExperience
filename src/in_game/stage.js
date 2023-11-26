import Component from "../component.js";

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

export default class gameStage extends Component {
  static emptyCanvas(class_, width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.className = class_;
    return canvas;
  }

  constructor(options) {
    console.log(options);

    const cell_size = Math.floor((WIDTH + BORDER) / options.width);
    const width = cell_size * options.width - BORDER;
    const height = cell_size * options.height - BORDER;

    const background = gameStage.emptyCanvas("background", width, height);
    const selections = gameStage.emptyCanvas("selections", width, height);
    const pieces = gameStage.emptyCanvas("pieces", width, height);

    const base = document.createElement("div");
    base.classList.add("stage");
    base.style.width = `${width}px`;
    base.style.height = `${height}px`;
    base.append(background, selections, pieces);

    super(base);

    this.x_count = options.width;
    this.y_count = options.height;

    this.cell_size = cell_size;
    this.width = width;
    this.height = height;

    this.background = background;
    this.selections = selections;
    this.pieces = pieces;

    this.black = undefined;
    this.white = undefined;
    this.piece_size = Math.floor(cell_size * PIECE_SIZE);
    this.piece_margin = Math.floor(cell_size * ((1 - PIECE_SIZE) / 2));

    this.load(options.black_piece_type, options.white_piece_type).then(() => {
      console.log(this.white);
      console.log(this.black);
      this.drawPieces([
        [0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 2, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ]);
    });

    this.redrawBackground();
  }

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

  drawPieces(board) {
    const ctx = this.pieces.getContext("2d");
    ctx.clearRect(0, 0, this.width, this.height);

    let x_offset = this.piece_margin;
    let y_offset = this.piece_margin;
    for (let y = 0; y < this.y_count; y += 1) {
      x_offset = this.piece_margin;
      for (let x = 0; x < this.x_count; x += 1) {
        const piece = board[y][x];
        if (piece > 0) {
          const img = piece === 1 ? this.black : this.white;
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
}
