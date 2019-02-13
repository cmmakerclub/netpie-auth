"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CMMC_Storage = undefined;

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var localStorage = require("node-localstorage").LocalStorage;
var keyMirror = require('key-mirror');

var CACHE_KEY = "mg_cached";

var IStorage = function () {
  function IStorage() {
    (0, _classCallCheck3.default)(this, IStorage);
    this._storage = {};
  }

  (0, _createClass3.default)(IStorage, [{
    key: "get",
    value: function get(k) {
      return this._storage[k];
    }
  }, {
    key: "set",
    value: function set(k, v) {
      this._storage[k] = v;
    }
  }, {
    key: "commit",
    value: function commit() {}
  }]);
  return IStorage;
}();

var MyStorage = function () {
  function MyStorage(name) {
    (0, _classCallCheck3.default)(this, MyStorage);

    this._private_storage = new localStorage('./' + name);
  }

  (0, _createClass3.default)(MyStorage, [{
    key: "setItem",
    value: function setItem(key, value) {
      return this._private_storage.setItem(key, value);
    }
  }, {
    key: "getItem",
    value: function getItem(key, func) {
      return this._private_storage.getItem(key);
    }
  }]);
  return MyStorage;
}();

var KEYS = {
  STATE: 0x01,
  OAUTH_REQUEST_TOKEN: 0x02,
  OAUTH_REQUEST_TOKEN_SECRET: 0x03,
  ACCESS_TOKEN: 0x04,
  ACCESS_TOKEN_SECRET: 0x05,
  REVOKE_TOKEN: 0x06,
  ENDPOINT: 0x07,
  FLAG: 0x08,
  APP_KEY: 0x09,
  APP_SECRET: 0x0a,
  VERIFIER: 0x0b,
  APP_ID: 0x0c
};

var KEYS_MIRRORED = keyMirror(KEYS);

var CMMC_Storage = exports.CMMC_Storage = function (_IStorage) {
  (0, _inherits3.default)(CMMC_Storage, _IStorage);

  function CMMC_Storage() {
    var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'tmp';
    var loaded_fn = arguments[1];
    (0, _classCallCheck3.default)(this, CMMC_Storage);

    var _this = (0, _possibleConstructorReturn3.default)(this, (CMMC_Storage.__proto__ || Object.getPrototypeOf(CMMC_Storage)).call(this));

    _this._storage_driver = null;

    _this._storage = {};
    _this._storage_driver = new MyStorage(name);
    _this.load();
    return _this;
  }

  (0, _createClass3.default)(CMMC_Storage, [{
    key: "load",
    value: function load() {
      var loaded = this._storage_driver.getItem(CACHE_KEY);
      this._storage = JSON.parse(loaded);
      if (this._storage === null) {
        this._storage = {};
        this.commit();
      }
      return this._storage;
    }
  }, {
    key: "clear",
    value: function clear() {
      this._storage = {};
      this.commit();
    }
  }, {
    key: "commit",
    value: function commit() {
      return this._storage_driver.setItem(CACHE_KEY, JSON.stringify(this._storage));
    }
  }]);
  return CMMC_Storage;
}(IStorage);

CMMC_Storage.STATE = keyMirror({
  STATE_REQ_TOKEN: null,
  STATE_ACCESS_TOKEN: null,
  STATE_REVOKE_TOKEN: null
});
CMMC_Storage.KEY_STATE = KEYS_MIRRORED.STATE;
CMMC_Storage.KEY_OAUTH_REQUEST_TOKEN = KEYS_MIRRORED.OAUTH_REQUEST_TOKEN;
CMMC_Storage.KEY_OAUTH_REQUEST_TOKEN_SECRET = KEYS_MIRRORED.OAUTH_REQUEST_TOKEN_SECRET;
CMMC_Storage.KEY_ACCESS_TOKEN = KEYS_MIRRORED.ACCESS_TOKEN;
CMMC_Storage.KEY_ACCESS_TOKEN_SECRET = KEYS_MIRRORED.ACCESS_TOKEN_SECRET;
CMMC_Storage.KEY_REVOKE_TOKEN = KEYS_MIRRORED.REVOKE_TOKEN;
CMMC_Storage.KEY_ENDPOINT = KEYS_MIRRORED.ENDPOINT;
CMMC_Storage.KEY_FLAG = KEYS_MIRRORED.FLAG;
CMMC_Storage.KEY_APP_KEY = KEYS_MIRRORED.APP_KEY;
CMMC_Storage.KEY_APP_SECRET = KEYS_MIRRORED.APP_SECRET;
CMMC_Storage.KEY_VERIFIER = KEYS_MIRRORED.VERIFIER;
CMMC_Storage.KEY_APP_ID = KEYS_MIRRORED.APP_ID;