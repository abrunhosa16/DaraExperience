import crypto from "crypto";

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
    this.users = {};

    // ids contained in this.searching for a particular size
    this.searching_by_size = {};
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

  searchUserGame(username, width, height) {
    if (!this.users.hasOwnProperty(username)) {
      return null;
    }

    for (const game of this.users[username]) {
      if (game.width === width && game.height === height) {
        return game;
      }
    }

    return null;
  }

  addUserGame(username, game) {
    if (this.users.hasOwnProperty(username)) {
      this.users[username] = [game];
    } else {
      this.users[username].push(game);
    }
  }

  deleteUserGame(username, width, height) {
    if (!this.users.hasOwnProperty(username)) {
      return;
    }

    const i = this.users[username].findIndex(
      (game) => game.width === width && game.height === height
    );
    if (i < 0) {
      return;
    }

    // delete element from array
    this.users[username].splice(i, 1);
  }

  // Gets called on endpoint /join
  // Supposed to not fail (throw any errors) and always return a game id
  // Refreshes timeouts if called multiple times for the same parameters
  //  while in "Connecting" or "Pairing" states
  join(username, width, height) {
    const user_game = searchUserGame(username, width, height);
    if (user_game !== null) {
      // this user is already playing a game with this exact width and height
      const { status, id } = this.users[users_key];

      if (status === USER_STATUS.CONNECTING || status === USER_STATUS.PAIRING) {
        this.games[id].connecting_timeout = this.joinTimeout(id, username);
      }

      return id;
    }

    const size_key = `${width}-${height}`;
    let id;
    if (this.searching_by_size.hasOwnProperty(size_key)) {
      // adequate pair found
      id = this.searching_by_size[size_key];

      // change searching user status to paired
      const searching_u_game = this.searchUserGame(
        this.games[id].searching,
        width,
        height
      );
      searching_u_game.status = USER_STATUS.PAIRING;
      delete this.searching_by_size[size_key];

      this.games[id].status = GAME_STATUS.PAIRING;
      this.games[id].connecting = username;
      this.games[id].connecting_timeout = this.joinTimeout(id, username);

      this.addUserGame(username, {
        id: id,
        status: USER_STATUS.PAIRED,
        width: width,
        height: height,
      });
    } else {
      // no adequate pair -> add to this.connecting
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

      this.addUserGame(username, {
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
      game.searching_timeout = this.searchTimeout(id, username);
      return;
    }

    if (game.connecting !== username) {
      throw new Error(
        `The user ${username} doesn't belong to the game with id <${id}>.`
      );
    }

    if (game.status === GAME_STATUS.CONNECTING) {
      clearTimeout(game.connecting_timeout);

      // change status from "Connecting" to "Searching"
      game.connecting = null;
      game.connecting_timeout = null;
      game.status = GAME_STATUS.SEARCHING;
      game.searching = username;
      game.searchTimeout = this.searchTimeout(id, username);

      this.addUserGame(username, {
        id: id,
        status: USER_STATUS.SEARCHING,
        width: width,
        height: height,
      });
      this.searching_by_size[`${game.width}-${game.height}`] = id;
    } else if (game.status === GAME_STATUS.PAIRING) {
      // two players successfully got paired and connected, meaning a game can start
      const self = username;
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

  // todo
  leave(id, username) {
    if (!this.by_id.hasOwnProperty(id)) {
      throw new Error("Invalid id");
    }

    const { username, width, height, timeout } = this.by_id[id];
    clearTimeout(timeout);

    delete this.by_size[width][height];
    if (Object.keys(this.by_size[width]).length === 0) {
      delete this.by_size[width];
    }
    delete this.by_username[username];

    delete this.by_id[id];

    console.log("leave", this.by_id);
  }
}
