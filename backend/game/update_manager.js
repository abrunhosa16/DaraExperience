import OngoingGame from "./ongoing.js";
import GamePairing from "./pairing.js";
import { winnerLoser } from "../store_results.js";

const stringify = (obj) => {
  const data = JSON.stringify(obj);
  return `data: ${data}\n\n`;
};

// time in seconds for each player
const PLAYER_TIME = 300;

export default class GameUpdateManager {
  constructor() {
    this.game_pairing = new GamePairing();

    // [game_id]: {
    //    username: str,
    //    connection: Response,
    //    alive: interval,
    //    left: bool,
    //    closing: timeout
    // }
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
    //    ended: bool (true if the game has ended and players are disconnecting)
    //    closing: timeout for game forceful deleting when ended
    // }
    this.ongoing = {};
  }

  join(username, width, height) {
    return this.game_pairing.join(username, width, height);
  }

  broadcast(id, data) {
    const obj = this.ongoing[id];
    const s = stringify(data);
    obj.player1.connection.write(s);
    obj.player2.connection.write(s);
  }

  deleteOngoing(id) {
    const obj = this.ongoing[id];
    clearInterval(obj.player1.alive);
    clearInterval(obj.player2.alive);
    clearInterval(obj.time_count_interval);

    obj.ended = true;
    obj.closing = setTimeout(() => {
      if (!obj.player1.disconnected) {
        // forcefully disconnect player 1
        obj.player1.connection.end();
      }
      if (!obj.player2.disconnected) {
        // forcefully disconnect player 1
        obj.player2.connection.end();
      }
      delete this.ongoing[id];
    });
  }

  writeResults(winner, loser, width, height) {
    winnerLoser(winner, loser, width, height);
  }

  deleteWaiting(id) {
    const obj = this.waiting[id];

    clearInterval(obj.alive);

    console.log("no winners final message");
    const s = stringify({ winner: null });
    obj.connection.write(s);

    obj.left = true;
    obj.closing = setTimeout(() => {
      obj.connection.end();
      delete this.waiting[id];
    });
  }

  leave(id, username) {
    if (this.waiting.hasOwnProperty(id) && !this.waiting[id].left) {
      this.game_pairing.leave(id, username);
      this.deleteWaiting(id);

      return;
    }

    if (this.ongoing.hasOwnProperty(id) && !this.ongoing[id].ended) {
      const obj = this.ongoing[id];
      const other = obj.player1 === username ? obj.player2 : obj.player1;

      this.broadcast({ winner: other });

      this.writeResults(other, username, obj.width, obj.height);
      this.deleteOngoing(id);

      return;
    }

    throw new Error("Requested game id does not exist");
  }

  getCountIntervalFuncPlayer1(id, obj) {
    return () => {
      obj.player1.time_remaining -= 1;
      if (obj.player1.time_remaining <= 0) {
        this.leave(id, obj.player1.username);
      }
    };
  }

  getCountIntervalFuncPlayer2(id, obj) {
    return () => {
      obj.player2.time_remaining -= 1;
      if (obj.player2.time_remaining <= 0) {
        this.leave(id, obj.player2.username);
      }
    };
  }

  // when player connection goes down (without forfeiting)
  disconnect(id, username) {
    console.log("disconnected");
    if (this.waiting.hasOwnProperty(id)) {
      // if player is just searching then kick him out
      if (this.waiting[id].left) {
        clearTimeout(this.waiting[id].closing);
      } else {
        clearInterval(this.waiting[id].alive);
        try {
          this.game_pairing.leave(id, username);
        } catch (err) {}

        this.waiting[id].connection.end();
      }

      delete this.waiting[id];
      return;
    }

    if (this.ongoing.hasOwnProperty(id)) {
      const obj = this.ongoing[id];
      if (obj.ended) {
        if (username === obj.player1.username) {
          obj.player1.disconnected = true;
        } else {
          obj.player2.disconnected = true;
        }

        if (obj.player1.disconnected && obj.player2.disconnected) {
          // gracefully delete game
          clearTimeout(obj.closing);
          delete this.ongoing[id];
        }
      }

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
      return;
    }

    // do nothing if the game already does not exist
  }

  // for when a connection occurs
  add(id, username, connection) {
    // interval for keeping the connection going (big intervals between writes
    // can make a browser try to restart or end the connection)
    const alive = setInterval(() => {
      connection.write("");
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

    const pairing = this.game_pairing.update(id, username, () => {
      // timeout
      if (this.waiting.hasOwnProperty(id)) {
        this.deleteWaiting(id);
      }
    });

    if (pairing === null) {
      // user is searching
      // todo: may override previous
      this.waiting[id] = {
        username: username,
        connection: connection,
        alive: alive,
        left: false,
        closing: null,
      };
    } else {
      const waiting = this.waiting[id];
      const game = new OngoingGame(
        id,
        pairing.player1,
        pairing.player2,
        pairing.width,
        pairing.height
      );
      const starting_player = game.currentPlayer();

      const obj = {
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
        width: pairing.width,
        height: pairing.height,
        ended: false,
        closing: null,
      };

      obj.time_count_interval = setInterval(
        starting_player === waiting.username
          ? this.getCountIntervalFuncPlayer1(id, obj)
          : this.getCountIntervalFuncPlayer2(id, obj),
        1000
      );

      this.ongoing[id] = obj;

      delete this.waiting[id];

      this.broadcast(id, game.getStatusData());
    }
  }

  notify(id, username, x, y) {
    if (this.ongoing.hasOwnProperty(id) && !this.ongoing.ended) {
      const obj = this.ongoing[id];
      const play_data = obj.game.play(username, x, y);

      const current_player = obj.game.currentPlayer();
      // switch timeouts if current player is different
      if (obj.player1_turn) {
        if (current_player !== obj.player1.username) {
          obj.player1_turn = false;
          clearInterval(obj.time_count_interval);
          obj.time_count_interval = this.getCountIntervalFuncPlayer2(id, obj);
        }
      } else {
        if (current_player !== obj.player2.username) {
          obj.player1_turn = true;
          clearInterval(obj.time_count_interval);
          obj.time_count_interval = this.getCountIntervalFuncPlayer1(id, obj);
        }
      }

      this.broadcast(id, play_data);

      if (play_data.winner !== undefined) {
        const loser =
          obj.player1.username === play_data.winner
            ? obj.player2.username
            : obj.player1.username;
        this.writeResults(play_data.winner, loser, obj.width, obj.height);
        this.deleteOngoing(id);
      }
    } else {
      throw new Error("Requested game does not exist");
    }
  }
}
