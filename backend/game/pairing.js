import crypto from "crypto";
import MultiValueDict from "../multi_value_dict.js";

const JOIN_TIMEOUT = 5000;
const SEARCH_TIMEOUT = 60000;

// Because of the way the API has to work, match pairing is structured in a
//    convoluted way in order to ensure adequate timeouts.

// A user can:
//    - Be paired with another if both have the same size.
//    - Leave (abort) at any time.
//    - Play multiple games with different sizes.

// The endpoints should return always the same game id if called with the
//    same parameters, as long as the timeouts haven't expired.
// Doing that will refresh the timeouts, so the endpoints should behave the
//    same while preventing a user from joining a game with the same size
//    twice.

// This class operates on endpoints /join, /update and /leave.
// The user is expected to call /update soon after /join, so there is only a
//    small timeout in between.

// There are four waiting states for a user:
//    /join: "Connecting" / "Paired",
//    /update: "Searching" / "Pairing"
//  - Connecting: The user called /join and no pairings exited.
//      A new game id was created and returned, and it will be forgotten if
//      /update is called in the next <JOIN_TIMEOUT> ms.
//  - Searching: The previous state was "Connecting" and /update was called.
//      Other users that calling /join can now get paired with this game.
//      The user can remain searching for <SEARCH_TIMEOUT> ms and should
//      automatically leave if the /update connection is closed.
//  - Paired: The user called /join and was paired with an adequate player.
//      The paired player game was upgraded to "Pairing" and will be downgraded
//      again if this user doesn't call /update in the next <JOIN_TIMEOUT> ms.
//  - Pairing: The previous state was "Searching" and another user called /join
//      and was paired. While the other user doesn't call /update or abort,
//      this game cannot get paired with anyone else.

// Because /join is expected to return immediately, the only way for pairing to
//    occur is if another user state is set to "Searching" with the same
//    size. This means that even that users get paired immediately, multiple
//    games can still wait for the same sizes because their status where
//    previously different.
// For example, if two users are "Connecting" at the same time and later
//    successfully go to "Searching", only when a third user calls the endpoint
//    again then a pairing will occur with the user that joined "Searching" first.

// This is the status of a specific user (see above)
export const USER_STATUS = {
  CONNECTING: "Connecting",
  SEARCHING: "Searching",
  PAIRED: "Paired",
  PAIRING: "Pairing",
};

// The game status
// Will be "Pairing" when there are two users connected
export const GAME_STATUS = {
  CONNECTING: "Connecting",
  SEARCHING: "Searching",
  PAIRING: "Pairing",
};

export default class GamePairing {
  constructor() {
    // [game_id]: {
    //    status: GAME_STATUS
    //    width
    //    height
    //    connecting:           "Connecting" or "Pairing" username
    //    connecting_timeout:   "Connecting" or "Pairing" user join timeout
    //    searching:            "Searching" or "Paired" username
    //    searching_timeout:    "Searching" or "Paired" user search timeout
    // }
    this.games = {};

    // existing users and their specific size respective state
    // [username]: [{
    //    id: game_id,
    //    status: USER_STATUS,
    //    width: width,
    //    height: height,
    //    onLeave: callback | null 
    // }]
    this.users = new MultiValueDict();

    // ids contained in this.searching for a particular size
    // [width-height]: [game_id]
    this.searching = {};
  }

  joinTimeout(id, username) {
    return setTimeout(() => {
      this.leave(id, username);
    }, JOIN_TIMEOUT);
  }

  searchTimeout(id, username, onTimeoutCallback) {
    return setTimeout(() => {
      onTimeoutCallback();
      this.leave(id, username);
    }, SEARCH_TIMEOUT);
  }

  findUserGame(username, width, height) {
    return this.users.find(
      username,
      (game) => game.width === width && game.height === height
    );
  }

  deleteUserGame(username, width, height) {
    return this.users.removeFirst(
      username,
      (game) => game.width === width && game.height === height
    );
  }

  getFirstSearching(width, height) {
    const key = `${width}-${height}`;
    if (this.searching.hasOwnProperty(key)) {
      return this.searching[key][0];
    }

    return undefined;
  }

  removeSearching(id, width, height) {
    const key = `${width}-${height}`;
    if (this.searching.hasOwnProperty(key)) {
      if (this.searching[key].length === 1) {
        if (this.searching[key][0] === id) {
          delete this.searching[key];
        }
      } else {
        // remove index element from array
        const i = this.searching[key].findIndex((t) => t === id);
        if (i < 0) {
          return;
        }
        this.searching[key].splice(i, 1);
      }
    }
  }

  addSearching(id, game) {
    const key = `${game.width}-${game.height}`;
    if (this.searching.hasOwnProperty(key)) {
      this.searching[key].push(id);
    } else {
      this.searching[key] = [id];
    }
  }

  // Gets called on endpoint /join
  // Supposed to not fail (throw any errors) and always return a game id
  // Refreshes timeouts if called multiple times for the same parameters
  //  while in "Connecting" or "Pairing" states
  join(username, width, height) {
    const user_game = this.findUserGame(username, width, height);
    if (user_game !== undefined) {
      // this user is already playing a game with this exact width and height
      const { status, id } = user_game;
      if (status === USER_STATUS.CONNECTING || status === USER_STATUS.PAIRING) {
        clearTimeout(this.games[id].connecting_timeout);
        this.games[id].connecting_timeout = this.joinTimeout(id, username);
      }

      return id;
    }

    let id;
    const pair = this.getFirstSearching(width, height);
    if (pair !== undefined) {
      // adequate pair found
      id = pair;

      // change searching user status to paired
      this.findUserGame(this.games[id].searching, width, height).status =
        USER_STATUS.PAIRING;

      // remove game from being flagged as searching
      this.removeSearching(id, width, height);

      this.games[id].status = GAME_STATUS.PAIRING;
      this.games[id].connecting = username;
      this.games[id].connecting_timeout = this.joinTimeout(id, username);

      this.users.add(username, {
        id: id,
        status: USER_STATUS.PAIRED,
        width: width,
        height: height,
      });
    } else {
      id = crypto.randomUUID(); // only instance where new game ids are generated
      this.games[id] = {
        status: GAME_STATUS.CONNECTING,
        width: width,
        height: height,
        connecting: username,
        connecting_timeout: this.joinTimeout(id, username),
        searching: null,
        searching_timeout: null,
      };

      this.users.add(username, {
        id: id,
        status: USER_STATUS.CONNECTING,
        width: width,
        height: height,
      });
    }

    return id;
  }

  // Gets called on endpoint /update
  // Throws an error if username doesn't belong to the game id
  // Refreshes timeouts if username is already searching
  // Returns a starting game if this user was paired, null otherwise
  update(id, username, onTimeoutCallback) {
    if (!this.games.hasOwnProperty(id)) {
      throw new Error(`The game with id <${id}> doesn't exist.`);
    }
    const game = this.games[id];

    if (game.searching === username) {
      // username is already searching, so just refresh timeouts
      clearTimeout(game.searching_timeout);
      game.searching_timeout = this.searchTimeout(id, username, onTimeoutCallback);
      return null;
    }

    if (game.connecting !== username) {
      throw new Error(
        `The user ${username} doesn't belong to the game with id <${id}>.`
      );
    }

    clearTimeout(game.connecting_timeout);

    if (game.status === GAME_STATUS.CONNECTING) {
      // change status from "Connecting" to "Searching"
      game.connecting = null;
      game.connecting_timeout = null;
      game.status = GAME_STATUS.SEARCHING;
      game.searching = username;
      game.searching_timeout = this.searchTimeout(id, username, onTimeoutCallback);

      this.findUserGame(username, game.width, game.height).status = USER_STATUS.SEARCHING;

      // flag this game as searching
      this.addSearching(id, game);

      return null;
    } else if (game.status === GAME_STATUS.PAIRING) {
      // two players successfully got paired and connected, meaning a game can start
      clearTimeout(game.searching_timeout);

      const self = game.connecting;
      const other = game.searching;
      const width = game.width;
      const height = game.height;

      // delete game from all objects
      delete this.games[id];
      this.deleteUserGame(self, width, height);
      this.deleteUserGame(other, width, height);

      return {
        id: id,
        player1: self,
        player2: other,
        width: width,
        height: height,
      };
    } else {
      // server error
      throw new Error(`The game with id <${id}> is in an invalid state`);
    }
  }

  leave(id, username) {
    if (!this.games.hasOwnProperty(id)) {
      throw new Error(`The game with id <${id}> doesn't exist.`);
    }
    const game = this.games[id];

    const notBelongError = () => {
      throw new Error(
        `The user ${username} does not belong to the game with id <${id}>.`
      );
    };

    switch (game.status) {
      case GAME_STATUS.CONNECTING:
        if (game.connecting !== username) {
          notBelongError();
        }
        clearTimeout(game.connecting_timeout);

        delete this.games[id];
        break;
      case GAME_STATUS.SEARCHING:
        if (game.searching !== username) {
          notBelongError();
        }
        clearTimeout(game.searching_timeout);

        this.removeSearching(id, game.width, game.height);
        delete this.games[id];
        break;
      case GAME_STATUS.PAIRING:
        if (game.connecting === username) {
          clearTimeout(game.connecting_timeout);

          // downgrade to searching
          game.status = GAME_STATUS.SEARCHING;
          game.connecting = null;
          game.connecting_timeout = null;
          this.findUserGame(game.searching, game.width, game.height).status =
            USER_STATUS.SEARCHING;

          this.addSearching(id, game);
        } else if (game.searching === username) {
          clearTimeout(game.searching_timeout);

          // downgrade to connecting
          game.status = GAME_STATUS.CONNECTING;
          game.searching = null;
          game.searching_timeout = null;
          this.findUserGame(game.connecting, width, height).status =
            USER_STATUS.CONNECTING;
        } else {
          notBelongError();
        }
    }

    this.deleteUserGame(username, game.width, game.height);
  }
}
