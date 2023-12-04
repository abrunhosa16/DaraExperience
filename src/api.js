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
    const response = await fetch(url, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({
        nick: username,
        password: password,
      }),
    });

    if (response.ok) {
      return { success: true, error_msg: null };
    } else {
      const error_data = await response.json();

      return { success: false, error_msg: error_data.error_field };
    }
  }

  async ranking(width, height) {
    const url = this.url + "/ranking";
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
      throw new Error(data.error_field);
    }
  }

  async join(cred_mgr, width, height) {
    const url = this.url + "/join";
    const response = await fetch(url, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({
        group: this.group,
        nick: cred_mgr.getUsername(),
        password: cred_mgr.getPassword(),
        size: { rows: height, columns: width },
      }),
    });

    const data = await response.json();
    if (response.ok) {
      return data.game;
    } else {
      throw new Error(data.error_field);
    }
  }

  async update(game_id, cred_mgr) {
    const url = this.url + "/update" + encodeURI(`nick=${cred_mgr.getUsername()}&game=${game_id}`);
    const e_source = new EventSource(url, {
      withCredentials: true,
    });

    return e_source;
    e_source.addEventListener("message", (e) => {
      console.log(e.data);
    });
  }
}
