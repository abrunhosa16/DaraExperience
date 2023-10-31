
("use strict");

const getStartingTurnFromGenData = (gen_data) => {
  // returns true if black or false if white
  if (gen_data.starting_player === "black") {
    return true
  }
  if (gen_data.starting_player === "white") {
    return false;
  }
  if (gen_data.starting_player === "random") {
    return Math.random() > 0.5;
  }
  throw new Error('Starting Player Data is invalid')
}

const createBoard = (width, height) => {
  const rows = [];
  for (let i = 0; i < height; i++) {
    const row = [];
    for (let j = 0; j < width; j++) {
      row.push(null);
    }
    rows.push(row);
  }
  return rows;
}

const playDropPhase = (state, row, col) => {
  if (!countAdjacent(state, row, col)  ||  !countColumn(state, row, col)){
    throw new Error("Not possible more than 3 in line")
  }
  if (state.board[row][col] !== null) {
    throw new Error("This cell is already occupied");
  }
  const black_turn = state.black_turn;

  state.board[row][col] = black_turn;
  state.black_turn = !black_turn;

  return [black_turn, false];
}


const countAdjacent = (state, row, col) => {
    const width = state.board.length;
    let acc = 0;
    for (let i = row - 1; i > 0; i--) {
      if (state.board[i][col] === state.black_turn) {
        acc += 1;
      }
      else {
        break;
      }
    }
    for (let j = row + 1; j < width; j++) {
      if (state.board[j][col] === state.black_turn) {
        acc += 1;
      }
      else {
        break;
      }
  
    }
    if (acc < 3) {
      return true;
    }
    else{
        return false;
    }
  }
  
  const countColumn = (state, row, col) => {
    const height = state.board[0].length;
    let acc = 0;
    for (let i = col - 1; i > 0; i--) {
      if (board[row][col] === state.black_turn) {
        acc += 1;
      }
      else {
        break;
      }
    }
    for (let j = col + 1; j < height; j++) {
      if (state.board[row][j] === state.black_turn) {
        acc += 1;
      }
      else {
        break;
      }
  
    }
    if (acc < 3) {
      return true;
    }
    else{
        return false;
    }
    }

export default (configs) => {
  const state = {
    black_drop_count: configs.black_count,
    white_drop_count: configs.white_count,
    black_turn: getStartingTurnFromGenData(configs),
    board: createBoard(configs.width, configs.height),
  };

  // expected return functions:

  // playDropPhase
  // Should play as current players's turn and return if the game drop phase has ended
  // ----------------
  // Returns [<true if black's turn, false otherwise>, drop_phase_ended]
  // Throws an error if the operation is invalid (with a message)

  return {
    playDropPhase: (row, col) => playDropPhase(state, row, col)
  }
}