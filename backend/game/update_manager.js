import OngoingGame from "./ongoing.js";
import GamePairing from "./pairing.js";

stringify = (obj) => {
  const data = JSON.stringify(obj);
  return `data: ${data}\n\n`;
};

// time in seconds for each player
const PLAYER_TIME = 300;

export default class GameUpdateManager {
  constructor() {
    this.game_pairing = new GamePairing();
    this.waiting = {};

    // [game_id]: {
    //    player1: {
    //      username: str,
    //      connection: Response object (from update)
    //      time_remaining: int (Time remaining in seconds),
    //      disconnected: bool (true if the player has been disconnected)
    //      alive: js interval for keeping the Response connection alive
    //    }
    //    player 2: <same as player 1>
    //    game: OngoingGame object
    //    player1_turn: bool (true if player 1 should play)
    //    time_count_interval: js interval for decreasing time
    // }
    this.ongoing = {};
  }

  join(username, width, height) {
    return this.game_pairing.join(username, width, height);
  }

  broadcast(id, data) {
    const obj = this.ongoing[id];
    obj.connection1.write(data);
    obj.connection2.write(data);
  }

  deleteOngoing(id) {
    const obj = this.ongoing[id];
    clearInterval(obj.player1.alive);
    clearInterval(obj.player2.alive);
    clearInterval(obj.time_count_interval);

    delete this.ongoing[obj];
  }

  writeWinner(username, width, height) {
    
  }

  leave(id, username) {
    if (this.waiting.hasOwnProperty(id)) {
      this.game_pairing.leave(id, username);
      delete this.waiting[id];
    } else {
      const obj = this.ongoing[id];
      const other = obj.player1 === username ? obj.player2 : obj.player1;

      this.broadcast({ winner: other });

      this.writeWinner(other);
      this.deleteOngoing(id);
    }
  }

  getCountIntervalFuncPlayer1(id) {
    this.ongoing[id].player1.time_remaining -= 1;
    if (this.ongoing[id].player1.time_remaining <= 0) {
      this.leave(id, this.ongoing[id].player1.username);
    }
  }

  getCountIntervalFuncPlayer2(id) {
    this.ongoing[id].player2.time_remaining -= 1;
    if (this.ongoing[id].player2.time_remaining <= 0) {
      this.leave(id, this.ongoing[id].player2.username);
    }
  }

  // when player connection goes down (without forfeiting)
  disconnect(id, username) {
    if (this.waiting.hasOwnProperty(id)) {
      // if player is just searching then kick him out
      clearInterval(this.waiting[id].alive);
      this.game_pairing.leave(id, username);
      delete this.waiting[id];
      return;
    }

    if (this.ongoing.hasOwnProperty(id)) {
      const obj = this.ongoing[id];
      if (username === obj.player1.username) {
        obj.player1.disconnected = true;
        clearInterval(obj.player1.alive);
      } else if (username === obj.player2.username) {
        obj.player2.disconnected = true;
        clearInterval(obj.player2.alive);
      } else {
        throw new Error("Invalid username in disconnect");
      }

      this.broadcast(id, { disconnected: username });
    }
  }

  add(id, username, connection) {
    const alive = setInterval(() => {
      response.write("");
    }, 450);

    // player in game
    if (
      this.ongoing.hasOwnProperty(id) &&
      this.ongoing[id].game.isPlayer(username)
    ) {
      const obj = this.ongoing[id];
      // reconnect player
      if (username === obj.player1.username) {
        obj.player1.disconnected = false;
        obj.player1.alive = alive;
      } else {
        obj.player2.disconnected = false;
        obj.player2.alive = alive;
      }

      this.broadcast(id, { reconnected: username });
      return;
    }

    const pairing = this.game_pairing.update(
      url_parsed.query.game,
      url_parsed.query.nick
    );

    if (pairing === null) {
      // user is searching
      this.waiting[id] = {
        username: username,
        connection: connection,
        alive: alive,
      };
    } else {
      const waiting = this.waiting[id];
      const game = new OngoingGame(id, player1, username, width, height);
      const starting_player = game.currentPlayer();
      const starting_player_count =
        starting_player === waiting.username
          ? this.getCountIntervalFuncPlayer1(id)
          : this.getCountIntervalFuncPlayer2(id);
      this.ongoing[id] = {
        player1: {
          username: waiting.username,
          connection: waiting.connection,
          alive: waiting.alive,
          time_remaining: PLAYER_TIME,
        },
        player2: {
          username: username,
          connection: connection,
          alive: alive,
          time_remaining: PLAYER_TIME,
        },
        game: game,
        player1_turn: starting_player === waiting.username,
        time_count_interval: setInterval(starting_player_count, 1000),
        width: pairing.width,
        height: pairing.height,
      };

      delete this.waiting[id];

      this.broadcast(id, game.getStatusData());
    }
  }

  notify(id, username, x, y) {
    const obj = this.ongoing[id];
    const play_data = obj.game.play(username, x, y);

    const current_player = obj.game.currentPlayer();
    // switch timeouts if current player is different
    if (obj.player1_turn) {
      if (current_player !== obj.player1.username) {
        obj.player1_turn = false;
        clearInterval(obj.time_count_interval);
        obj.time_count_interval = this.getCountIntervalFuncPlayer2(id);
      }
    } else {
      if (current_player !== obj.player2.username) {
        obj.player1_turn = true;
        clearInterval(obj.time_count_interval);
        obj.time_count_interval = this.getCountIntervalFuncPlayer1(id);
      }
    }

    this.broadcast(id, play_data);

    if (play_data.winner !== undefined) {
      this.writeWinner(play_data.winner);
      this.deleteOngoing(id);
    }
  }
}
