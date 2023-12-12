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
//  - Paired: The user called /join and was automatically paired with a adequate player.
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


export default class GamePairing {
  constructor() {
    this.games = {};

    // this.games cache
    this.by_size = {};
  }

  join(username, width, height, timeout, timeout_callback) {
    if (this.by_username.hasOwnProperty(username)) {
      return {
        id: this.by_username[username],
        paired: false,
      };
    }

    if (this.by_size.hasOwnProperty(width)) {
      const by_width = this.by_size[width];
      if (by_width.hasOwnProperty(height)) {
        const id = by_width[height];
        const other = this.by_username[id];

        // delete other
        this.leave(id);

        return {
          id: id,
          paired: true,
          user1: other,
          user2: username,
        };
      }
    } else {
      this.by_size[width] = {};
    }

    const id = crypto.randomUUID();
    this.by_id[id] = {
      username: username,
      width: width,
      height: height,
      timeout: setTimeout(() => {
        this.leave(id);
        if (timeout_callback !== undefined) {
          timeout_callback();
        }
      }, timeout),
    };
    this.by_username = id;
    this.by_size[width][height] = id;

    console.log("join", this.by_id);

    return {
      id: id,
      paired: false,
    };
  }

  refreshTimeout(id, timeout, timeout_callback) {
    if (!this.by_id.hasOwnProperty(id)) {
      throw new Error("Invalid id");
    }
    clearTimeout(this.by_id[id].timeout);
    this.by_id[id].timeout = setTimeout(() => {
      this.leave(id);
      if (timeout_callback !== undefined) {
        timeout_callback();
      }
    }, timeout);
  }

  leave(id) {
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
