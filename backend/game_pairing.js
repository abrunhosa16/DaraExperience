import crypto from "crypto";
import MultiValueDict from "./multi_value_dict.js";

const JOIN_TIMEOUT = 5000;
const SEARCH_TIMEOUT = 60000;

// Because of the way the API has to work, match pairing is structured in a convoluted way
//  in order to ensure adequate timeouts.
// All players can only be paired with each other if they have the same size and group.
// A user can leave while being in any state.
// Because the game ids are not directly tied to a user, they can play multiple
//  games at the same time. However, if they try to create a game multiple
//  times for the same parameters they are just going to refresh the timeouts.

// There are four waiting states for a user:
//  - Connecting: The user called /join and no pairings exited.
//      They received a new game id and will be forgotten if they not call
//      /update in the next <JOIN_TIMEOUT> ms.
//  - Searching: The user was connected by calling /update while previously
//      "Connecting" and will wait for another user to /join. This state has a
//      timeout of <SEARCH_TIMEOUT> ms in which a <no winners> message is sent
//      and the user is expected to disconnect.
//  - Paired: The user called /join and was automatically paired with an adequate player.
//      They received the game id of the paired player and will be forgotten if
//      they not call /update in the next <JOIN_TIMEOUT> ms. If the other user leaves,
//      the state is changed to "Connecting" with the
//  - Pairing: The state was previously "Searching" and another player called
//      /join however hasn't called /update yet. In this state, no new pairings
//      can be received. If the other user calls /update they will be
//      successfully paired and the game will start, otherwise the state will
//      change again to "Searching" (this also happens if the other user
//      specifically leaves).

// Because /join is expected to return immediately, the only way for a user to
//  get paired is to call the endpoint and another user be "Searching" with the
//  adequate parameters. This means that multiple states can be "Searching" at
//  the same time in witch case another user that calls /join will pair with
//  the oldest waiting one.
// For example, if two users are "Connecting" at the same time and later
//  successfully go to "Searching", only when a third user calls the endpoint
//  again then a pairing will occur with the user that joined "Searching" first.

const USER_STATUS = {
  CONNECTING: "Connecting",
  SEARCHING: "Searching",
  PAIRED: "Paired",
  PAIRING: "Pairing",
};

const GAME_STATUS = {
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
    //    height: height
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

  searchTimeout(id, username) {
    return setTimeout(() => {
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

  addSearching(game) {
    const key = `${game.width}-${game.height}`;
    if (this.searching.hasOwnProperty(key)) {
      this.searching[key].push(game.id);
    } else {
      this.searching[key] = [game.id];
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
      const searching_u_game = this.findUserGame(
        this.games[id].searching,
        width,
        height
      );
      // pairing doesn't refresh searching timeout
      searching_u_game.status = USER_STATUS.PAIRING;
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
  update(id, username) {
    if (!this.games.hasOwnProperty(id)) {
      throw new Error(`The game with id <${id}> doesn't exist.`);
    }
    const game = this.games[id];

    if (game.searching === username) {
      // username is already searching, so just refresh timeouts
      clearTimeout(game.searching_timeout);
      game.searching_timeout = this.searchTimeout(id, username);
      return;
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
      game.searching_timeout = this.searchTimeout(id, username);

      this.addUserGame(username, {
        id: id,
        status: USER_STATUS.SEARCHING,
        width: game.width,
        height: game.height,
      });
      this.addSearching(game);
    } else if (game.status === GAME_STATUS.PAIRING) {
      // two players successfully got paired and connected, meaning a game can start
      clearTimeout(game.searching_timeout);

      const self = game.connecting;
      const other = game.searching;
      const width = game.width;
      const height = game.height;

      delete this.games[id];
      this.deleteUserGame(self, width, height);
      this.deleteUserGame(other, width, height);

      // todo
      console.log("Started game!", self, other, width, height);
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

          this.addSearching(game);
        } else if (game.searching === username) {
          clearTimeout(game.searching_timeout);

          // downgrade to connecting
          game.status = GAME_STATUS.CONNECTING;
          game.searching = null;
          game.searching_timeout = null;
        } else {
          notBelongError();
        }
    }

    this.deleteUserGame(username, game.width, game.height);
  }
}
