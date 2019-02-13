let localStorage = require('node-localstorage').LocalStorage
let keyMirror = require('key-mirror')

const CACHE_KEY = 'mg_cached'

class IStorage {
  _storage = {}

  constructor () {

  }

  get (k) {
    return this._storage[k]
  }

  set (k, v) {
    this._storage[k] = v
  }

  commit () { }
}

class MemoryStorage extends IStorage {
  constructor (name) {
    super()
  }

  setItem (key, value) {
    return this.set(key, value)
  }

  getItem (key, func) {
    return this.get(key)
  }

}

class MyStorage {
  constructor (name) {
    this._private_storage = new localStorage('./' + name)
  }

  setItem (key, value) {
    return this._private_storage.setItem(key, value)
  }

  getItem (key, func) {
    return this._private_storage.getItem(key)
  }
}

let KEYS_MIRRORED = keyMirror({
  STATE: null,
  OAUTH_REQUEST_TOKEN: null,
  OAUTH_REQUEST_TOKEN_SECRET: null,
  ACCESS_TOKEN: null,
  ACCESS_TOKEN_SECRET: null,
  REVOKE_TOKEN: null,
  ENDPOINT: null,
  FLAG: null,
  APP_KEY: null,
  APP_SECRET: null,
  VERIFIER: null,
  APP_ID: null,
})

export class CMMC_Storage extends IStorage {
  _storage_driver = null

  static STATE = keyMirror({
    STATE_REQ_TOKEN: null,
    STATE_ACCESS_TOKEN: null,
    STATE_REVOKE_TOKEN: null,
  })

  static KEY_STATE = KEYS_MIRRORED.STATE
  static KEY_OAUTH_REQUEST_TOKEN = KEYS_MIRRORED.OAUTH_REQUEST_TOKEN
  static KEY_OAUTH_REQUEST_TOKEN_SECRET = KEYS_MIRRORED.OAUTH_REQUEST_TOKEN_SECRET
  static KEY_ACCESS_TOKEN = KEYS_MIRRORED.ACCESS_TOKEN
  static KEY_ACCESS_TOKEN_SECRET = KEYS_MIRRORED.ACCESS_TOKEN_SECRET
  static KEY_REVOKE_TOKEN = KEYS_MIRRORED.REVOKE_TOKEN
  static KEY_ENDPOINT = KEYS_MIRRORED.ENDPOINT
  static KEY_FLAG = KEYS_MIRRORED.FLAG
  static KEY_APP_KEY = KEYS_MIRRORED.APP_KEY
  static KEY_APP_SECRET = KEYS_MIRRORED.APP_SECRET
  static KEY_VERIFIER = KEYS_MIRRORED.VERIFIER
  static KEY_APP_ID = KEYS_MIRRORED.APP_ID

  constructor (name = 'tmp', loaded_fn) {
    super()
    this._storage = {}
    this._storage_driver = new MemoryStorage(name)
    this.load()
  }

  load () {
    let loaded = this._storage_driver.getItem(CACHE_KEY) || JSON.stringify({})
    this._storage = JSON.parse(loaded)
    if (this._storage === null) {
      this._storage = {}
      this.commit()
    }
    return this._storage
  }

  clear () {
    this._storage = {}
    this.commit()
  }

  commit () {
    return this._storage_driver.setItem(CACHE_KEY, JSON.stringify(this._storage))
  }
}