const STATUS = {
  NOT_CONNECTED: 0,
  CONNECTING: 1,
  SEARCHING: 2,
  ABORTING_SEARCH: 3,
};

export default class OnlineGameManager {
  constructor(api, cred_mgr) {
    this.api = api;
    this.cred_mgr = cred_mgr;

    this.status = STATUS.NOT_CONNECTED;
    this.in_game = false;

    this.abortSearchCallback = null;
    this.stopSearch = null;

    this.game_id = null;
  }

  async searchGame(width, height) {
    if (this.status === STATUS.ABORTING_SEARCH) {
      throw new Error(
        "Attempted to search for a new game while aborting previous search"
      );
    }

    // return immediately if trying to connect or already searching for a game
    if (
      this.status === STATUS.CONNECTING ||
      this.status === STATUS.SEARCHING
    ) {
      throw new Error(
        "Attempted to search multiple times at the same time for a game"
      );
    }

    if (this.in_game) {
      throw new Error("Attempted to search for a game while already in another");
    }

    this.status = STATUS.CONNECTING;
    let game_id;
    try {
      game_id = await this.api.join(this.cred_mgr, width, height);
    } catch (err) {
      // failed to start searching for a game
      this.status = STATUS.NOT_CONNECTED;
      throw err;
    }

    console.log("Joined", game_id);

    if (this.status === STATUS.ABORTING_SEARCH) {
      await this.api.leave(this.cred_mgr, game_id);
      this.abortSearchCallback();
      return;
    }

    this.game_id = game_id;
    this.status = STATUS.SEARCHING;
      const { connected, addOnMessage, close } = this.api.update(
        this.cred_mgr,
        this.game_id
      );
    this.stopSearch = close;
    addOnMessage((data) => {
      console.log(data);
      this.start(data);
    })

    // if search is cancelled the await will have no effect
    await connected;
  }

  start(data) {
    if (this.status == STATUS.ABORTING_SEARCH || this.status === STATUS.NOT_CONNECTED) {
      return;
    }

    this.in_game = true;
    // todo
    console.log("started!")
  }

  async abortSearch() {
    if (this.status === STATUS.CONNECTING) {
      this.status = STATUS.ABORTING_SEARCH;
      // wait to connect and instantly cancel
      return new Promise((resolve, reject) => {
        this.abortSearchCallback = () => {
          this.status = STATUS.NOT_CONNECTED;
          resolve();
        }
      })
    }

    if (this.status === STATUS.SEARCHING) {
      this.status = STATUS.ABORTING_SEARCH;
      this.stopSearch();

      await this.api.leave(this.cred_mgr, this.game_id);

      this.status = STATUS.NOT_CONNECTED;
      this.game_id = null;
      return;
    }

    throw new Error("Attempting to cancel search while not searching");
  }
}
