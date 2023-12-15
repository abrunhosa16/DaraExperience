export default class MultiValueDict {
  constructor() {
    this.d = {};
  }

  find(key, callback) {
    if (!this.d.hasOwnProperty(key)) {
      return undefined;
    }
    return this.d[key].find(callback);
  }

  add(key, item) {
    if (this.d.hasOwnProperty(key)) {
      this.d[key].push(item);
    } else {
      this.d[key] = [item];
    }
  }

  removeFirst(key, callback) {
    if (!this.d.hasOwnProperty(key)) {
      return false;
    }

    const i = this.d[key].findIndex(callback);
    if (i < 0) {
      return false;
    }

    if (this.d[key].length === 1) {
      delete this.d[key];
    } else {
      // remove element from array
      this.d[key].splice(i, 1);
    }

    return true;
  }
}
