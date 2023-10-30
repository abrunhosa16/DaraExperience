
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
            row.push(0);
        }
        rows.push(row);
    }
    return rows;
}

const playDropPhase = (state, x, y) => {
    if (state.board[y][x] !== 0) {
        return null;
    }
    const black_turn = state.black_turn;

    state.board[y][x] = black_turn ? 1 : 2;
    state.black_turn = !black_turn;

    return black_turn;
}


const countAdjacent = (row, col, turn) =>{
    const width = board.length;
    let acc = 0;
    for (let i = row; i > 0; i-- ){
        if (board[i - 1][col] === turn){
            acc += 1;
        }
        else{
            break;
        }
    }
    for (let j = row + 1; j < width; j++ ){
        if (board[j][col] === turn){
            acc += 1;
    }
        else{
            break;
        }

    }
    if (acc < 3){
        return true;
    }
}

const countColumn = (row, col, turn) =>{
    const height = board[0].length;
    let acc = 0;
    for (let i = col - 1; i > 0; i-- ){
        if (board[row][col] === turn){
            acc += 1;
        }
        else{
            break;
        }
    }
    for (let j = col + 1; j < height; j++ ){
        if (board[row][j] === turn){
            acc += 1;
    }
        else{
            break;
        }

    }
    if (acc < 3){
        return true;
    }
}


export default (gen_data, setOnPlay) => {
    const state = {
        black_drop_count: gen_data.black_count,
        white_drop_count: gen_data.white_count,
        black_turn: getStartingTurnFromGenData(gen_data),
        board: createBoard(gen_data.width, gen_data.height),
    };

    setOnPlay((x, y) => playDropPhase(state, x, y));
}