("use strict");

const JSON_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

export class API {
  constructor(url, group) {
    this.url = url;
    this.group = group;
  }

  async register(username, password) {
    const url = this.url + "/register";

    let response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({
          nick: username,
          password: password,
        }),
      });
    } catch (err) {
      console.error(err);
      throw new Error("Failed to establish a connection");
    }

    if (response.ok) {
      return;
    }

    const data = await response.json();
    throw new Error(data.error);
  }

  async ranking(width, height) {
    const url = this.url + "/ranking";

    let response;
    try {
      response = response = await fetch(url, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({
          group: this.group,
          size: { rows: height, columns: width },
        }),
      });
    } catch (err) {
      console.error(err);
      throw new Error("Failed to establish a connection");
    }

    // shouldn't fail
    const data = await response.json();
    if (response.ok) {
      return data.ranking;
    }

    throw new Error(data.error);
  }

  async join(cred_mgr, width, height) {
    const url = this.url + "/join";

    let response;
    try {
      response = response = await fetch(url, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({
          group: this.group,
          nick: cred_mgr.getUsername(),
          password: cred_mgr.getPassword(),
          size: { rows: height, columns: width },
        }),
      });
    } catch (err) {
      console.error(err);
      throw new Error("Failed to establish a connection");
    }

    const data = await response.json();
    if (response.ok) {
      return data.game;
    }

    throw new Error(data.error);
  }

  update(cred_mgr, game_id) {
    const url =
      this.url +
      "/update?" +
      encodeURI(`nick=${cred_mgr.getUsername()}&game=${game_id}`);

    const e_source = new EventSource(url, {
      withCredentials: false,
    });

    return {
      connected: new Promise((resolve, reject) => {
        e_source.addEventListener("open", (e) => {
          console.log("open", Date.now(), e);
          resolve();
        });
        e_source.addEventListener("start", (e) => {
          console.log("start", Date.now(), e);
          resolve();
        });
        e_source.addEventListener("error", (e) => {
          console.log("error", Date.now(), e);
          reject(e);
        });
      }),
      addOnMessage: (func) => {
        e_source.addEventListener("message", (e) => {
          console.log("message", Date.now(), e);
          func(JSON.parse(e.data));
        });
      },
      close: () => {
        e_source.close();
      },
    };
  }

  async leave(cred_mgr, game_id) {
    const url = this.url + "/leave";

    let response;
    try {
      response = response = await fetch(url, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({
          nick: cred_mgr.getUsername(),
          password: cred_mgr.getPassword(),
          game: game_id,
        }),
      });
    } catch (err) {
      console.error(err);
      throw new Error("Failed to establish a connection");
    }

    if (response.ok) {
      return;
    }

    const data = await response.json();
    throw new Error(data.error);
  }
}
