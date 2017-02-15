"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NetpieOAuth = undefined;

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var OAuth = require('oauth-1.0a');

var CryptoJS = require("crypto-js");
var fetch = require("node-fetch");

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

var NetpieOAuth = exports.NetpieOAuth = function () {
  function NetpieOAuth(props) {
    var _this = this;

    (0, _classCallCheck3.default)(this, NetpieOAuth);
    this.OAuthGetRequestToken = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
      var req1_resp, token, req2_resp;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _this.build_request_object('/api/rtoken').data({ oauth_callback: 'scope=&appid=' + _this.appid + '&mgrev=' + MGREV + '&verifier=' + verifier }).request(function (request_token) {
                return _this.oauth.toHeader(_this.oauth.authorize(request_token)).Authorization;
              });

            case 2:
              req1_resp = _context.sent;
              _context.t0 = _this;
              _context.next = 6;
              return req1_resp.text();

            case 6:
              _context.t1 = _context.sent;
              token = _context.t0.extract.call(_context.t0, _context.t1);
              _context.next = 10;
              return _this.build_request_object('/api/atoken').data({ oauth_verifier: verifier }).request(function (req_acc_token) {
                var _reqtok = {
                  key: token.oauth_token,
                  secret: token.oauth_token_secret
                };
                var auth_header = _this.oauth.toHeader(_this.oauth.authorize(req_acc_token, _reqtok)).Authorization;
                console.log("auth_header", auth_header);
                return auth_header;
              });

            case 10:
              req2_resp = _context.sent;
              _context.t2 = _this;
              _context.next = 14;
              return req2_resp.text();

            case 14:
              _context.t3 = _context.sent;
              return _context.abrupt("return", _context.t2.extract.call(_context.t2, _context.t3));

            case 16:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, _this);
    }));

    console.log("props", props);
    this.appid = props.appid;
    this.appkey = props.appkey;
    this.appsecret = props.appsecret;
    this.create(props);
  }

  (0, _createClass3.default)(NetpieOAuth, [{
    key: "getOAuthObject",
    value: function getOAuthObject() {
      return this.oauth;
    }
  }, {
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
      var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(data, auth_func) {
        var ret;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                ret = fetch(data.url, {
                  method: data.method,
                  headers: {
                    'Authorization': auth_func.apply(this, [data])
                  }
                });
                return _context2.abrupt("return", ret);

              case 2:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function request(_x, _x2) {
        return _ref2.apply(this, arguments);
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
  return NetpieOAuth;
}();