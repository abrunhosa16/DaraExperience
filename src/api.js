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

  async ranking(rows, columns) {
    const url = this.url + "/ranking";
    const response = await fetch(url, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({
        group: this.group,
        size: { rows: rows, columns: columns },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.ranking;
    } else {
      throw "Unknown error";
    }
  }
}
