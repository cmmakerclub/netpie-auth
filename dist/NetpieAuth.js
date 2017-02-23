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

var _Storage = require("./Storage");

var _Util = require("./Util");

var Helper = _interopRequireWildcard(_Util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var OAuth = require('oauth-1.0a');

var CryptoJS = require("crypto-js");
var fetch = require("node-fetch");

var Util = Helper.Util;

var VERSION = '1.0.9';
var GEARAPIADDRESS = 'ga.netpie.io';
var GEARAPIPORT = '8080';
var MGREV = 'NJS1a';

var gearauthurl = 'http://' + GEARAPIADDRESS + ':' + GEARAPIPORT;
var verifier = MGREV;

var NetpieAuth = exports.NetpieAuth = function () {
  function NetpieAuth(props) {
    var _this = this;

    (0, _classCallCheck3.default)(this, NetpieAuth);

    this.getMqttAuth = function () {
      var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(callback) {
        var _ref2, appkey, appsecret, appid, _ref3, access_token, access_token_secret, endpoint, hkey, mqttusername, mqttpassword, revoke_code, _endpoint$match, _endpoint$match2, input, protocol, host, port, ret, token;

        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(_this._storage.get(_Storage.CMMC_Storage.KEY_STATE) == _Storage.CMMC_Storage.STATE.STATE_ACCESS_TOKEN)) {
                  _context.next = 14;
                  break;
                }

                Util.log("STATE = ACCESS_TOKEN");
                _ref2 = [_this.appkey, _this.appsecret, _this.appid], appkey = _ref2[0], appsecret = _ref2[1], appid = _ref2[2];
                _ref3 = [_this._storage.get(_Storage.CMMC_Storage.KEY_ACCESS_TOKEN), _this._storage.get(_Storage.CMMC_Storage.KEY_ACCESS_TOKEN_SECRET)], access_token = _ref3[0], access_token_secret = _ref3[1];
                endpoint = decodeURIComponent(_this._storage.get(_Storage.CMMC_Storage.KEY_ENDPOINT));
                hkey = Util.compute_hkey(access_token_secret, appsecret);
                mqttusername = appkey + "%" + Math.floor(Date.now() / 1000);
                mqttpassword = Util.compute_mqtt_password(access_token, mqttusername, hkey);
                revoke_code = Util.compute_revoke_code(access_token, hkey);
                _endpoint$match = endpoint.match(/^([a-z]+):\/\/([^:\/]+):(\d+)/), _endpoint$match2 = (0, _slicedToArray3.default)(_endpoint$match, 4), input = _endpoint$match2[0], protocol = _endpoint$match2[1], host = _endpoint$match2[2], port = _endpoint$match2[3];
                ret = {
                  username: mqttusername,
                  password: mqttpassword,
                  client_id: access_token,
                  prefix: "/" + appid + "/gearname",
                  appid: appid,
                  host: host,
                  port: port,
                  endpoint: endpoint
                };

                callback.apply(_this, [ret]);
                _context.next = 29;
                break;

              case 14:
                _context.prev = 14;
                _context.next = 17;
                return _this.getToken();

              case 17:
                token = _context.sent;

                if (!(token !== null)) {
                  _context.next = 22;
                  break;
                }

                return _context.abrupt("return", _this.getMqttAuth(callback));

              case 22:
                return _context.abrupt("return", null);

              case 23:
                _context.next = 29;
                break;

              case 25:
                _context.prev = 25;
                _context.t0 = _context["catch"](14);

                console.log(62, _context.t0);
                return _context.abrupt("return", null);

              case 29:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, _this, [[14, 25]]);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }();

    this._getRequestToken = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              return _context2.abrupt("return", _this.build_request_object('/api/rtoken').data({ oauth_callback: "scope=&appid=" + _this.appid + "&mgrev=" + MGREV + "&verifier=" + verifier }).request(function (request_token) {
                return _this.oauth.toHeader(_this.oauth.authorize(request_token)).Authorization;
              }));

            case 1:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, _this);
    }));
    this._getAccessToken = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
      return _regenerator2.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              return _context3.abrupt("return", _this.build_request_object('/api/atoken').data({ oauth_verifier: verifier }).request(function (request_data) {
                var _reqtok = {
                  key: _this._storage.get(_Storage.CMMC_Storage.KEY_OAUTH_REQUEST_TOKEN),
                  secret: _this._storage.get(_Storage.CMMC_Storage.KEY_OAUTH_REQUEST_TOKEN_SECRET)
                };
                var auth_header = _this.oauth.toHeader(_this.oauth.authorize(request_data, _reqtok)).Authorization;
                return auth_header;
              }));

            case 1:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, _this);
    }));

    this._saveRequestToken = function (params) {
      Util.log("SET STATE= " + _Storage.CMMC_Storage.STATE.STATE_REQ_TOKEN);
      var _data = new Map();

      _data.set(_Storage.CMMC_Storage.KEY_STATE, _Storage.CMMC_Storage.STATE.STATE_REQ_TOKEN);
      _data.set(_Storage.CMMC_Storage.KEY_OAUTH_REQUEST_TOKEN, params.oauth_token);
      _data.set(_Storage.CMMC_Storage.KEY_OAUTH_REQUEST_TOKEN_SECRET, params.oauth_token_secret);
      _data.set(_Storage.CMMC_Storage.KEY_VERIFIER, params.verifier);

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = _data.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _step$value = (0, _slicedToArray3.default)(_step.value, 2),
              key = _step$value[0],
              value = _step$value[1];

          Util.log("SAVE REQ TOKEN: KEY ", key, ">>", value);
          _this._storage.set(key, value);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    };

    this._saveAccessToken = function (object) {
      Util.log("SET STATE= " + _Storage.CMMC_Storage.STATE.STATE_ACCESS_TOKEN);
      var _data = new Map();
      _data.set(_Storage.CMMC_Storage.KEY_STATE, _Storage.CMMC_Storage.STATE.STATE_ACCESS_TOKEN);
      _data.set(_Storage.CMMC_Storage.KEY_ACCESS_TOKEN, object.oauth_token);
      _data.set(_Storage.CMMC_Storage.KEY_ACCESS_TOKEN_SECRET, object.oauth_token_secret);
      _data.set(_Storage.CMMC_Storage.KEY_ENDPOINT, object.endpoint);
      _data.set(_Storage.CMMC_Storage.KEY_FLAG, object.flag);

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = _data.entries()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _step2$value = (0, _slicedToArray3.default)(_step2.value, 2),
              key = _step2$value[0],
              value = _step2$value[1];

          _this._storage.set(key, value);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      _this._storage.commit();
    };

    this.getToken = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
      var token, req1_resp, text, _extract, oauth_token, oauth_token_secret, req2_resp, _token, err;

      return _regenerator2.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              token = null;
              _context4.prev = 1;

              Util.log("NetpieAuth.js " + _this);
              // @flow STEP1: GET REQUEST TOKEN
              _context4.next = 5;
              return _this._getRequestToken();

            case 5:
              req1_resp = _context4.sent;

              if (!req1_resp.ok) {
                _context4.next = 23;
                break;
              }

              _context4.next = 9;
              return req1_resp.text();

            case 9:
              text = _context4.sent;
              _extract = _this.extract(text), oauth_token = _extract.oauth_token, oauth_token_secret = _extract.oauth_token_secret;

              _this._saveRequestToken({ oauth_token: oauth_token, oauth_token_secret: oauth_token_secret, verifier: verifier });

              // @flow STEP2: GET ACCESS TOKEN
              _context4.next = 14;
              return _this._getAccessToken();

            case 14:
              req2_resp = _context4.sent;
              _context4.t0 = _this;
              _context4.next = 18;
              return req2_resp.text();

            case 18:
              _context4.t1 = _context4.sent;
              _token = _context4.t0.extract.call(_context4.t0, _context4.t1);

              _this._saveAccessToken({
                oauth_token: _token.oauth_token,
                oauth_token_secret: _token.oauth_token_secret,
                endpoint: _token.endpoint,
                flag: _token.flag
              });
              _context4.next = 25;
              break;

            case 23:
              err = {
                name: 'NetpieError',
                type: 'Invalid AppKey or AppSecret',
                message: req1_resp.status + " " + req1_resp.statusText + " (Invalid App/Secret Key)"
              };
              throw new Error(err.message);

            case 25:
              return _context4.abrupt("return", token);

            case 28:
              _context4.prev = 28;
              _context4.t2 = _context4["catch"](1);

              console.error(_context4.t2);
              return _context4.abrupt("return", null);

            case 32:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, _this, [[1, 28]]);
    }));

    this.appid = props.appid;
    this.appkey = props.appkey;
    this.appsecret = props.appsecret;
    this.create(props);
    this._storage = new _Storage.CMMC_Storage(this.appid);
  }

  (0, _createClass3.default)(NetpieAuth, [{
    key: "create",
    value: function create(config) {
      this.oauth = OAuth({
        consumer: {
          key: config.appkey,
          secret: config.appsecret
        },
        last_ampersand: true,
        signature_method: 'HMAC-SHA1',
        hash_function: function hash_function(base_string, key) {
          return Util.hmac(base_string, key);
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
      var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(data, auth_func) {
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
        return _ref7.apply(this, arguments);
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