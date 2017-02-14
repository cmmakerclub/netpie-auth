"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NetpieOAuth = undefined;

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

var appid = "HelloNETPIE";
var appkey = "r0q49xoEnqf0ctw";
var appsecret = "KvWGcHYfNNzKN3dAYKXVwUhf1";

var NetpieOAuth = exports.NetpieOAuth = function () {
  function NetpieOAuth(props) {
    var _this = this;

    (0, _classCallCheck3.default)(this, NetpieOAuth);
    this.OAuthGetRequestToken = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
      var requesttoken, gearauthurl, gearalias, verifier, request_data, req1, body, response_extracted, reqtok, request_access_token, req3;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              requesttoken = {};


              if (securemode) gearauthurl = 'https://' + GEARAPIADDRESS + ':' + GEARAPISECUREPORT;else gearauthurl = 'http://' + GEARAPIADDRESS + ':' + GEARAPIPORT;

              gearalias = undefined;

              if (gearalias) verifier = gearalias;else verifier = MGREV;

              // console.log("GearAuthURL", gearauthurl);

              request_data = {
                url: gearauthurl + '/api/rtoken',
                method: 'POST',
                data: {
                  oauth_callback: 'scope=&appid=' + appid + '&mgrev=' + MGREV + '&verifier=' + verifier
                }
              };
              _context.prev = 5;
              _context.next = 8;
              return fetch(request_data.url, {
                method: request_data.method,
                headers: {
                  'Authorization': _this.oauth.toHeader(_this.oauth.authorize(request_data)).Authorization
                }
              });

            case 8:
              req1 = _context.sent;
              _context.next = 11;
              return req1.text();

            case 11:
              body = _context.sent;
              response_extracted = _this.extract(body);

              requesttoken.token = response_extracted.oauth_token;
              requesttoken.secret = response_extracted.oauth_token_secret;
              requesttoken.verifier = verifier;

              reqtok = {
                key: requesttoken.token,
                secret: requesttoken.secret
              };

              // access token

              request_access_token = {
                url: gearauthurl + '/api/atoken',
                method: 'POST',
                data: {
                  oauth_verifier: verifier
                }
              };
              _context.next = 20;
              return fetch(request_access_token.url, {
                method: request_access_token.method,
                headers: {
                  'Authorization': _this.oauth.toHeader(_this.oauth.authorize(request_access_token, reqtok)).Authorization
                }
              });

            case 20:
              req3 = _context.sent;
              return _context.abrupt("return", req3.text());

            case 24:
              _context.prev = 24;
              _context.t0 = _context["catch"](5);

              console.log("error: ", _context.t0);

            case 27:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, _this, [[5, 24]]);
    }));

    console.log("props", props);
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
      var out = {};
      var arr = response.split('&');
      for (var i = 0; i < arr.length; i++) {
        var a = arr[i].split('=');
        out[a[0]] = a[1];
      }
      return out;
    }
  }]);
  return NetpieOAuth;
}();