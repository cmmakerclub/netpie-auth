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

var CMMC_Storage = exports.CMMC_Storage = function (_IStorage) {
  (0, _inherits3.default)(CMMC_Storage, _IStorage);

  function CMMC_Storage() {
    var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'tmp';
    var open_now = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
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
      if (this._storage == null) {
        this._storage = {};
      }
    }
  }, {
    key: "commit",
    value: function commit() {
      this._storage_driver.setItem(CACHE_KEY, JSON.stringify(this._storage));
    }
  }]);
  return CMMC_Storage;
}(IStorage);

CMMC_Storage.STATE = keyMirror({
  STATE_REQ_TOKEN: null,
  STATE_ACCESS_TOKEN: null
});
CMMC_Storage.KEY_STATE = 0x01;
CMMC_Storage.KEY_OAUTH_REQUEST_TOKEN = 0x02;
CMMC_Storage.KEY_OAUTH_REQUEST_TOKEN_SECRET = 0x03;
CMMC_Storage.KEY_ACCESS_TOKEN = 0x04;
CMMC_Storage.KEY_ACCESS_TOKEN_SECRET = 0x05;
CMMC_Storage.KEY_REVOKE_TOKEN = 0x06;
CMMC_Storage.KEY_ENDPOINT = 0x07;
CMMC_Storage.KEY_FLAG = 0x08;
CMMC_Storage.KEY_APP_KEY = 0x09;
CMMC_Storage.KEY_APP_SECRET = 0x0a;
CMMC_Storage.KEY_VERIFIER = 0x0b;