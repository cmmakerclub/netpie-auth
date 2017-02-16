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

var localStorage = require("node-localstorage").JSONStorage;

var IStorage = function () {
  function IStorage() {
    (0, _classCallCheck3.default)(this, IStorage);
    this._storage = {};

    console.log("HELLO");
  }

  (0, _createClass3.default)(IStorage, [{
    key: "get",
    value: function get(k) {

      console.log("GET>>>", this._storage);
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

var keyMirror = require('key-mirror');

var CMMC_Storage = exports.CMMC_Storage = function (_IStorage) {
  (0, _inherits3.default)(CMMC_Storage, _IStorage);

  function CMMC_Storage() {
    var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'tmp';
    var open_now = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    (0, _classCallCheck3.default)(this, CMMC_Storage);

    var _this = (0, _possibleConstructorReturn3.default)(this, (CMMC_Storage.__proto__ || Object.getPrototypeOf(CMMC_Storage)).call(this));

    _this._storage_driver = null;

    _this._storage_driver = new localStorage('./' + name);
    if (open_now) {
      _this.load();
    }
    return _this;
  }

  (0, _createClass3.default)(CMMC_Storage, [{
    key: "load",
    value: function load() {
      this._storage = this._storage_driver.getItem("mg_cached");
    }
  }, {
    key: "commit",
    value: function commit() {
      this._storage_driver.setItem("mg_cached", this._storage);
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
CMMC_Storage.KEY_APP_KEY = 0x08;
CMMC_Storage.KEY_APP_SECRET = 0x09;
CMMC_Storage.KEY_VERIFIER = 0x10;