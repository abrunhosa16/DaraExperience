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

  register(username, password) {
    const url = this.url + "/register";
    return fetch(url, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({
        nick: username,
        password: password,
      }),
    }).then(
      (response) => {
        if (response.ok) {
          return;
        }
        throw new Error(data.error);
      },
      (err) => {
        console.error(err);
        throw new Error("Failed to establish a connection");
      }
    );
  }

  async ranking(width, height) {
    const url = this.url + "/ranking";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({
          group: this.group,
          size: { rows: height, columns: width },
        }),
      });

      const data = await response.json();
      if (response.ok) {
        return data.ranking;
      } else {
        throw new Error(data.error);
      }
    } catch (e) {
      throw new Error(e);
    }
  }

  join(cred_mgr, width, height) {
    const url = this.url + "/join";
    return fetch(url, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({
        group: this.group,
        nick: cred_mgr.getUsername(),
        password: cred_mgr.getPassword(),
        size: { rows: height, columns: width },
      }),
    })
      .then(
        (response) => response.json(),
        (err) => {
          console.error(err);
          throw new Error("Failed to establish a connection");
        }
      )
      .then((data) => {
        if (response.ok) {
          return data.game;
        }
        throw new Error(data.error);
      });
  }

  update(cred_mgr, game_id) {
    const url =
      this.url +
      "/update" +
      encodeURI(`nick=${cred_mgr.getUsername()}&game=${game_id}`);
    const e_source = new EventSource(url, {
      withCredentials: true,
    });

    return {
      connected: new Promise((resolve, reject) => {
        e_source.addEventListener("open", (e) => {
          console.log(e);
          resolve();
        });
        e_source.addEventListener("error", (e) => {
          console.log(e);
          reject(e);
        });
      }),
      addOnMessage: (func) => {
        e_source.addEventListener("message", (e) => {
          func(JSON.parse(e.data));
        });
      },
      close: () => {
        e_source.close();
      },
    };
  }

  leave(cred_mgr, game_id) {
    const url = this.url + "/leave";

    return fetch(url, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({
        nick: cred_mgr.getUsername(),
        password: cred_mgr.getPassword(),
        game: game_id,
      }),
    }).then(
      (response) => {
        if (response.ok) {
          return;
        }
        throw new Error(data.error);
      },
      (err) => {
        console.error(err);
        throw new Error("Failed to establish a connection");
      }
    );
  }
}
