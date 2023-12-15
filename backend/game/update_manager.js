import OngoingGame from "./ongoing.js";
import GamePairing from "./pairing.js";

export default class GameUpdateManager {
  constructor() {
    this.game_pairing = new GamePairing();
    this.waiting = {};
    this.ongoing = {};
  }

  join(username, width, height) {
    return this.game_pairing.join(username, width, height);
  }

  leave(id, username) {
    if (this.waiting.hasOwnProperty(id)) {
    }
    this.game_pairing.leave(id, username);
  }

  add(id, username, connection) {
    const game = this.game_pairing.update(
      url_parsed.query.game,
      url_parsed.query.nick
    );
    if (game === null) {
      this.waiting[id] = {
        username: username,
        connection: connection,
      };
    } else {
      const {username: player1, connection: connection1} = this.waiting[id];
      this.ongoing = new OngoingGame(id, player1, username, width, height);
    }
  }

  notify(id, username, move) {
    this.ongoing[id].play(username);
  }
}
