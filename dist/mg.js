"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NetpieAuth = undefined;

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _Util = require("./Util");

var Helper = _interopRequireWildcard(_Util);

var _storage = require("./storage");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var OAuth = require('oauth-1.0a');

var CryptoJS = require("crypto-js");
var fetch = require("node-fetch");
var localStorage = require("node-localstorage").JSONStorage;


var Util = Helper.Util;

var VERSION = '1.0.9';
var GEARAPIADDRESS = 'ga.netpie.io';
var GEARAPIPORT = '8080';
var GEARAPISECUREPORT = '8081';
var GBPORT = '1883';
var GBSPORT = '8883';
var USETLS = false;
var securemode = false;

var MGREV = 'NJS1a';

var gearauthurl = 'http://' + GEARAPIADDRESS + ':' + GEARAPIPORT;
var verifier = MGREV;

var STATE = _storage.CMMC_Storage.STATE;

var NetpieAuth = exports.NetpieAuth = function () {
  function NetpieAuth(props) {
    var _this = this;

    (0, _classCallCheck3.default)(this, NetpieAuth);

    this.getMqttAuth = function () {
      var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(callback) {
        var appkey, appsecret, appid, access_token, access_token_secret, endpoint, hkey, mqttusername, mqttpassword, revoke_code, _endpoint$match, _endpoint$match2, input, protocol, host, port, matched, ret;

        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(_this._storage.get(_storage.CMMC_Storage.KEY_STATE) == STATE.STATE_ACCESS_TOKEN)) {
                  _context.next = 17;
                  break;
                }

                appkey = _this.appkey;
                appsecret = _this.appsecret;
                appid = _this.appid;
                access_token = _this._storage.get(_storage.CMMC_Storage.KEY_ACCESS_TOKEN);
                access_token_secret = _this._storage.get(_storage.CMMC_Storage.KEY_ACCESS_TOKEN_SECRET);
                endpoint = decodeURIComponent(_this._storage.get(_storage.CMMC_Storage.KEY_ENDPOINT));
                hkey = Util.compute_hkey(access_token_secret, appsecret);
                mqttusername = appkey + "%" + Math.floor(Date.now() / 1000);
                mqttpassword = Util.compute_mqtt_password(access_token, mqttusername, hkey);
                revoke_code = Util.compute_revoke_code(access_token, hkey);
                _endpoint$match = endpoint.match(/^([a-z]+):\/\/([^:\/]+):(\d+)/), _endpoint$match2 = (0, _slicedToArray3.default)(_endpoint$match, 4), input = _endpoint$match2[0], protocol = _endpoint$match2[1], host = _endpoint$match2[2], port = _endpoint$match2[3];
                matched = endpoint.match(/^([a-z]+):\/\/([^:\/]+):(\d+)/);
                ret = {
                  username: mqttusername,
                  password: mqttpassword,
                  client_id: access_token,
                  prefix: "/" + appid + "/gearname",
                  appid: appid, host: host, port: port, endpoint: endpoint
                };


                callback.call(null, ret);

                _context.next = 26;
                break;

              case 17:
                _context.prev = 17;
                _context.next = 20;
                return _this.getToken();

              case 20:
                return _context.abrupt("return", _this.getMqttAuth());

              case 23:
                _context.prev = 23;
                _context.t0 = _context["catch"](17);
                return _context.abrupt("return", null);

              case 26:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, _this, [[17, 23]]);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }();

    this._getRequestToken = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
      var req1_resp;
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _this._storage.set(_storage.CMMC_Storage.KEY_STATE, STATE.STATE_REQ_TOKEN);
              _context2.next = 3;
              return _this.build_request_object('/api/rtoken').data({ oauth_callback: 'scope=&appid=' + "" + _this.appid + '&mgrev=' + MGREV + '&verifier=' + verifier }).request(function (request_token) {
                return _this.oauth.toHeader(_this.oauth.authorize(request_token)).Authorization;
              });

            case 3:
              req1_resp = _context2.sent;
              return _context2.abrupt("return", req1_resp);

            case 5:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, _this);
    }));
    this._getAccessToken = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
      var req2_resp;
      return _regenerator2.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _this._storage.set(_storage.CMMC_Storage.KEY_STATE, STATE.STATE_ACCESS_TOKEN);
              _context3.next = 3;
              return _this.build_request_object('/api/atoken').data({ oauth_verifier: verifier }).request(function (request_data) {
                var _reqtok = {
                  key: _this._storage.get(_storage.CMMC_Storage.KEY_OAUTH_REQUEST_TOKEN),
                  secret: _this._storage.get(_storage.CMMC_Storage.KEY_OAUTH_REQUEST_TOKEN_SECRET)
                };
                // console.log("req_acc_token", request_data)
                // console.log("auth_header", auth_header)
                var auth_header = _this.oauth.toHeader(_this.oauth.authorize(request_data, _reqtok)).Authorization;
                return auth_header;
              });

            case 3:
              req2_resp = _context3.sent;
              return _context3.abrupt("return", req2_resp);

            case 5:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, _this);
    }));

    this._saveRequestToken = function (object) {
      _this._storage.set(_storage.CMMC_Storage.KEY_STATE, STATE.STATE_REQ_TOKEN);
      _this._storage.set(_storage.CMMC_Storage.KEY_OAUTH_REQUEST_TOKEN, object.oauth_token);
      _this._storage.set(_storage.CMMC_Storage.KEY_OAUTH_REQUEST_TOKEN_SECRET, object.oauth_token_secret);
      _this._storage.set(_storage.CMMC_Storage.KEY_VERIFIER, object.verifier);
    };

    this._saveAccessToken = function (object) {
      _this._storage.set(_storage.CMMC_Storage.KEY_STATE, STATE.STATE_ACCESS_TOKEN);
      _this._storage.set(_storage.CMMC_Storage.KEY_ACCESS_TOKEN, object.oauth_token);
      _this._storage.set(_storage.CMMC_Storage.KEY_ACCESS_TOKEN_SECRET, object.oauth_token_secret);
      _this._storage.set(_storage.CMMC_Storage.KEY_ENDPOINT, object.endpoint);
      _this._storage.set(_storage.CMMC_Storage.KEY_FLAG, object.flag);
      // if done then serialize to storage
      _this._storage.commit();
    };

    this.getToken = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
      var req1_resp, _extract, oauth_token, oauth_token_secret, req2_resp, token2;

      return _regenerator2.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.prev = 0;
              _context4.next = 3;
              return _this._getRequestToken();

            case 3:
              req1_resp = _context4.sent;
              _context4.t0 = _this;
              _context4.next = 7;
              return req1_resp.text();

            case 7:
              _context4.t1 = _context4.sent;
              _extract = _context4.t0.extract.call(_context4.t0, _context4.t1);
              oauth_token = _extract.oauth_token;
              oauth_token_secret = _extract.oauth_token_secret;

              _this._saveRequestToken({ oauth_token: oauth_token, oauth_token_secret: oauth_token_secret, verifier: verifier });

              // STEP2: GET ACCESS TOKEN
              _context4.next = 14;
              return _this._getAccessToken();

            case 14:
              req2_resp = _context4.sent;
              _context4.t2 = _this;
              _context4.next = 18;
              return req2_resp.text();

            case 18:
              _context4.t3 = _context4.sent;
              token2 = _context4.t2.extract.call(_context4.t2, _context4.t3);

              _this._saveAccessToken({
                oauth_token: token2.oauth_token,
                oauth_token_secret: token2.oauth_token_secret,
                endpoint: token2.endpoint,
                flag: token2.flag
              });

              return _context4.abrupt("return", token2);

            case 24:
              _context4.prev = 24;
              _context4.t4 = _context4["catch"](0);
              return _context4.abrupt("return", false);

            case 27:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, _this, [[0, 24]]);
    }));

    // console.log("props", props);
    this.appid = props.appid;
    this.appkey = props.appkey;
    this.appsecret = props.appsecret;
    this.create(props);
    // initialize this._storage
    this._storage = new _storage.CMMC_Storage(this.appid);
  }

  (0, _createClass3.default)(NetpieAuth, [{
    key: "create",


    // getOAuthObject () {
    //   return this.oauth;
    // }

    value: function create(config) {
      this.oauth = OAuth({
        consumer: {
          key: config.appkey,
          secret: config.appsecret
        },
        last_ampersand: true,
        signature_method: 'HMAC-SHA1',
        hash_function: function hash_function(base_string, key) {
          return CryptoJS.HmacSHA1(base_string, key).toString(CryptoJS.enc.Base64);
        }
      });
    }
  }, {
    key: "extract",
    value: function extract(response) {
      var arr = response.split('&');
      var reduced = arr.reduce(function (acc, v) {
        var _v$split = v.split("="),
            _v$split2 = (0, _slicedToArray3.default)(_v$split, 2),
            key = _v$split2[0],
            value = _v$split2[1];

        acc[key] = value;
        return acc;
      }, {});
      return reduced;
    }
  }, {
    key: "request",
    value: function () {
      var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(data, auth_func) {
        var ret;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                ret = fetch(data.url, {
                  method: data.method,
                  timeout: 5000,
                  headers: {
                    'Authorization': auth_func.apply(this, [data])
                  }
                });
                return _context5.abrupt("return", ret);

              case 2:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function request(_x2, _x3) {
        return _ref5.apply(this, arguments);
      }

      return request;
    }()
  }, {
    key: "build_request_object",
    value: function build_request_object(uri) {
      var _this2 = this;

      var method = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'POST';

      var obj = {
        method: method,
        url: gearauthurl + uri
      };

      var ret = {
        object: function object() {
          return obj;
        },
        data: function data(val) {
          obj.data = val;
          return ret;
        },
        request: function request(auth_func) {
          return _this2.request(ret.object(), auth_func);
        }
      };
      return ret;
    }
  }]);
  return NetpieAuth;
}();