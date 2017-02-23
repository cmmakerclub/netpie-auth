let localStorage = require("node-localstorage").LocalStorage
let keyMirror = require('key-mirror');

const CACHE_KEY = "mg_cached"

class IStorage {
  _storage = {}

  constructor () {

  }

  get (k) {
    return this._storage[k];
  }

  set (k, v) {
    this._storage[k] = v;
  }

  commit () {
  }
}

class MyStorage {
  constructor (name) {
    this._private_storage = new localStorage('./' + name);
  }

  setItem (key, value) {
    return this._private_storage.setItem(key, value);
  }

  getItem (key, func) {
    return this._private_storage.getItem(key);
  }
}

export class CMMC_Storage extends IStorage {
  _storage_driver = null

  static STATE = keyMirror({
    STATE_REQ_TOKEN: null,
    STATE_ACCESS_TOKEN: null,
    STATE_REVOKE_TOKEN: null,
  });

  static KEY_STATE = 0x01
  static KEY_OAUTH_REQUEST_TOKEN = 0x02
  static KEY_OAUTH_REQUEST_TOKEN_SECRET = 0x03
  static KEY_ACCESS_TOKEN = 0x04
  static KEY_ACCESS_TOKEN_SECRET = 0x05
  static KEY_REVOKE_TOKEN = 0x06
  static KEY_ENDPOINT = 0x07
  static KEY_FLAG = 0x08
  static KEY_APP_KEY = 0x09
  static KEY_APP_SECRET = 0x0a
  static KEY_VERIFIER = 0x0b

  constructor (name = 'tmp', loaded_fn) {
    super();
    this._storage = {}
    this._storage_driver = new MyStorage(name);
    this.load();
  }

  load () {
    let loaded = this._storage_driver.getItem(CACHE_KEY);
    this._storage = JSON.parse(loaded)
    if (this._storage == null) {
      this._storage = {};
      this.commit();
    }
    return this._storage;
  }

  commit () {
    this._storage_driver.setItem(CACHE_KEY, JSON.stringify(this._storage));
  }
}