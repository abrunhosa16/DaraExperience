
class OnlineGameManager {
  constructor(api, cred_mgr) {
    this.api = api;
    this.cred_mgr = cred_mgr;
  }

  async join(width, height) {
    this.api.join(cred_mgr, width, height).then((game_id) => {
      this.api.update(game_id)
    })
  }
}