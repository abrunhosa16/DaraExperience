const STATUS = {
  NOT_CONNECTED: 0,
  CONNECTING: 1,
  SEARCHING: 2,
  ABORTING_SEARCH: 3,
  IN_GAME: 4,
};

export default class OnlineGameManager {
  constructor(api, cred_mgr) {
    this.api = api;
    this.cred_mgr = cred_mgr;

    this.status = STATUS.NOT_CONNECTED;
    this.in_game = false;

    this.stopSearch = null;

    this.game_id = null;
  }

  // resolves when connecting to the server
  searchGame(width, height) {
    return new Promise((resolve, reject) => {
      if (this.status === STATUS.ABORTING_SEARCH) {
        return reject(
          "Attempted to search for a new game while aborting previous search"
        );
      }

      // return immediately if trying to connect or already searching for a game
      if (
        this.status === STATUS.CONNECTING ||
        this.status === STATUS.SEARCHING
      ) {
        return reject(
          "Attempted to search multiple times at the same time for a game"
        );
      }

      if (this.in_game) {
        return reject(
          "Attempted to search for a game while already in another"
        );
      }

      this.status = STATUS.CONNECTING;
      this.api.join(this.cred_mgr, width, height).then(
        (game_id) => {
          if (this.status === STATUS.ABORTING_SEARCH) {
            this.api.leave(this.cred_mgr, game_id).then(
              () => {
                resolve({
                  result: "Aborted",
                });
              },
              (err) => {
                reject(err);
              }
            );
            return;
          } else {
            resolve({
              result: "Searching",
              search_ended: new Promise((resolve, reject) => {
                this.status = STATUS.SEARCHING;
                const { connected, addOnMessage, removeOnMessage, close } =
                  this.api.update(this.cred_mgr, this.game_id);

                // stop search should automatically reject connected promise
                this.stopSearch = close;

                const first_message_received = new Promise(
                  (resolve, reject) => {
                    const func = addOnMessage((message) => {
                      removeOnMessage(func);
                      resolve(message);
                    });
                  }
                );
                connected.then(
                  () => {
                    first_message_received.then((message) => {
                      if (message.winner === null) {
                        this.status = STATUS.NOT_CONNECTED;
                        resolve({
                          result: "Timeout reached",
                        });
                        close();
                      } else {
                        this.status = STATUS.IN_GAME;
                        resolve({
                          result: "Success",
                        });
                        close(); // temporary
                      }
                    });
                  },
                  (err) => {
                    this.status = STATUS.NOT_CONNECTED;
                    if (err === "Aborted") {
                      this.api.leave(this.cred_mgr, game_id).then(
                        () => {
                          resolve({
                            result: "Aborted",
                          });
                        },
                        (err) => {
                          reject(err);
                        }
                      );
                    } else {
                      console.error(err);
                      reject("An error ocurred while searching for a match");
                    }
                  }
                );
              }),
            });
          }
        },
        (err) => {
          this.status = STATUS.NOT_CONNECTED;
          reject(err);
        }
      );
    });
  }

  abortSearch() {
    console.log(this.status);
    if (
      this.status !== STATUS.CONNECTING &&
      this.status !== STATUS.SEARCHING &&
      this.status !== STATUS.ABORTING_SEARCH
    ) {
      throw new Error("Attempting to cancel search while not searching");
    }

    const old = this.status;
    this.status = STATUS.ABORTING_SEARCH;
    if (old === STATUS.SEARCHING) {
      this.stopSearch();
    }
  }
}
