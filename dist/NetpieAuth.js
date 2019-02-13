'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NetpieAuth = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _CStorage = require('./CStorage');

var _Util = require('./Util');

var Helper = _interopRequireWildcard(_Util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var OAuth = require('oauth-1.0a');
var fetch = require('node-fetch');


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
    this.initilized = false;

    this.getMqttAuth = function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(callback) {
        var _ref2, appkey, appsecret, appid, _ref3, access_token, access_token_secret, endpoint, hkey, mqttusername, mqttpassword, _endpoint$match, _endpoint$match2, input, protocol, host, port, revoke_token, ret;

        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(_this._storage.get(_CStorage.CMMC_Storage.KEY_STATE) === _CStorage.CMMC_Storage.STATE.STATE_ACCESS_TOKEN)) {
                  _context.next = 15;
                  break;
                }

                Util.debug('STATE = ACCESS_TOKEN');
                _ref2 = [_this.appkey, _this.appsecret, _this.appid], appkey = _ref2[0], appsecret = _ref2[1], appid = _ref2[2];
                _ref3 = [_this._storage.get(_CStorage.CMMC_Storage.KEY_ACCESS_TOKEN), _this._storage.get(_CStorage.CMMC_Storage.KEY_ACCESS_TOKEN_SECRET)], access_token = _ref3[0], access_token_secret = _ref3[1];
                endpoint = decodeURIComponent(_this._storage.get(_CStorage.CMMC_Storage.KEY_ENDPOINT));
                hkey = Util.compute_hkey(access_token_secret, appsecret);
                // let mqttusername = `${appkey}%${Math.floor(Date.now() / 1000)}`

                mqttusername = '' + appkey;
                mqttpassword = Util.compute_mqtt_password(access_token, mqttusername, hkey);
                _endpoint$match = endpoint.match(/^([a-z]+):\/\/([^:\/]+):(\d+)/), _endpoint$match2 = (0, _slicedToArray3.default)(_endpoint$match, 4), input = _endpoint$match2[0], protocol = _endpoint$match2[1], host = _endpoint$match2[2], port = _endpoint$match2[3];
                revoke_token = Util.compute_revoke_code(access_token, hkey);

                Util.debug('revoke_token = ' + revoke_token);
                ret = {
                  revoke_token: revoke_token, appid: appid, host: host, port: port, endpoint: endpoint,
                  username: mqttusername,
                  password: mqttpassword,
                  client_id: access_token,
                  prefix: '/' + appid + '/gearname/'
                };

                callback.apply(_this, [ret]);
                _context.next = 22;
                break;

              case 15:
                if (!(_this._storage.get(_CStorage.CMMC_Storage.KEY_STATE) === _CStorage.CMMC_Storage.STATE.STATE_REQ_TOKEN)) {
                  _context.next = 20;
                  break;
                }

                Util.debug('req token');
                return _context.abrupt('return', _this.getMqttAuth(callback));

              case 20:
                _context.next = 22;
                return _this.getOAuthToken().then(function () {
                  _this.getMqttAuth(callback);
                }).catch(function (ex) {
                  Util.debug('Error => ', ex.message);
                  throw ex;
                });

              case 22:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }();

    this._getRequestToken = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              return _context2.abrupt('return', _this.buildRequestObject('/api/rtoken').data({ oauth_callback: 'scope=&appid=' + _this.appid + '&mgrev=' + MGREV + '&verifier=' + verifier }).request(function (request_token) {
                return _this.oauth.toHeader(_this.oauth.authorize(request_token)).Authorization;
              }));

            case 1:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this);
    }));
    this._getAccessToken = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
      return _regenerator2.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              return _context3.abrupt('return', _this.buildRequestObject('/api/atoken').data({ oauth_verifier: verifier }).request(function (request_data) {
                var _reqtok = {
                  key: _this._storage.get(_CStorage.CMMC_Storage.KEY_OAUTH_REQUEST_TOKEN),
                  secret: _this._storage.get(_CStorage.CMMC_Storage.KEY_OAUTH_REQUEST_TOKEN_SECRET)
                };
                var auth_header = _this.oauth.toHeader(_this.oauth.authorize(request_data, _reqtok)).Authorization;
                return auth_header;
              }));

            case 1:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, _this);
    }));

    this._saveRequestToken = function (params) {
      Util.debug('SET STATE= ' + _CStorage.CMMC_Storage.STATE.STATE_REQ_TOKEN);
      var _data = new Map();

      _data.set(_CStorage.CMMC_Storage.KEY_STATE, _CStorage.CMMC_Storage.STATE.STATE_REQ_TOKEN);
      _data.set(_CStorage.CMMC_Storage.KEY_OAUTH_REQUEST_TOKEN, params.oauth_token);
      _data.set(_CStorage.CMMC_Storage.KEY_OAUTH_REQUEST_TOKEN_SECRET, params.oauth_token_secret);
      _data.set(_CStorage.CMMC_Storage.KEY_VERIFIER, params.verifier);
      _data.set(_CStorage.CMMC_Storage.KEY_APP_ID, _this.appid);
      _data.set(_CStorage.CMMC_Storage.KEY_APP_KEY, _this.appkey);
      _data.set(_CStorage.CMMC_Storage.KEY_APP_SECRET, _this.appsecret);

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = _data.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _step$value = (0, _slicedToArray3.default)(_step.value, 2),
              key = _step$value[0],
              value = _step$value[1];

          Util.debug('SAVE REQ TOKEN: KEY ', key, '>>', value);
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
      Util.debug('SET STATE= ' + _CStorage.CMMC_Storage.STATE.STATE_ACCESS_TOKEN);
      var _data = new Map();
      _data.set(_CStorage.CMMC_Storage.KEY_STATE, _CStorage.CMMC_Storage.STATE.STATE_ACCESS_TOKEN);
      _data.set(_CStorage.CMMC_Storage.KEY_ACCESS_TOKEN, object.oauth_token);
      _data.set(_CStorage.CMMC_Storage.KEY_ACCESS_TOKEN_SECRET, object.oauth_token_secret);
      _data.set(_CStorage.CMMC_Storage.KEY_REVOKE_TOKEN, object.revoke_token);
      _data.set(_CStorage.CMMC_Storage.KEY_ENDPOINT, object.endpoint);
      _data.set(_CStorage.CMMC_Storage.KEY_FLAG, object.flag);

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

    this.getOAuthToken = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
      var req1_resp, text, _extract, oauth_token, oauth_token_secret, req2_resp, access_token, hkey, revoke_token, err;

      return _regenerator2.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return _this._getRequestToken();

            case 2:
              req1_resp = _context4.sent;

              if (!req1_resp.ok) {
                _context4.next = 24;
                break;
              }

              _context4.next = 6;
              return req1_resp.text();

            case 6:
              text = _context4.sent;
              _extract = _this.extract(text), oauth_token = _extract.oauth_token, oauth_token_secret = _extract.oauth_token_secret;
              // @flow STEP1.2:
              // CACHE Request Token

              _this._saveRequestToken({ oauth_token: oauth_token, oauth_token_secret: oauth_token_secret, verifier: verifier });

              // @flow STEP2:
              // GET ACCESS TOKEN
              _context4.next = 11;
              return _this._getAccessToken();

            case 11:
              req2_resp = _context4.sent;

              if (req2_resp.ok) {
                _context4.next = 14;
                break;
              }

              throw new Error('Reached maximum (devices) quota.');

            case 14:
              _context4.t0 = _this;
              _context4.next = 17;
              return req2_resp.text();

            case 17:
              _context4.t1 = _context4.sent;
              access_token = _context4.t0.extract.call(_context4.t0, _context4.t1);


              // compute revoke token
              hkey = Util.compute_hkey(access_token.oauth_token_secret, _this.appsecret);
              revoke_token = Util.compute_revoke_code(access_token.oauth_token, hkey);

              // @flow STEP2.2: CACHE Access Token

              _this._saveAccessToken({
                oauth_token: access_token.oauth_token,
                oauth_token_secret: access_token.oauth_token_secret,
                endpoint: access_token.endpoint,
                flag: access_token.flag,
                revoke_token: revoke_token
              });
              _context4.next = 26;
              break;

            case 24:
              err = {
                name: 'NetpieError',
                type: 'Invalid AppKey or AppSecret',
                message: req1_resp.status + ' ' + req1_resp.statusText + ' (Invalid AppKey or AppSecret)'
              };
              throw new Error(err.message);

            case 26:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, _this);
    }));

    this.appid = props.appid;
    this.appkey = props.appkey;
    this.appsecret = props.appsecret;
    this.prepare(props);
    this.initSync();
  }

  (0, _createClass3.default)(NetpieAuth, [{
    key: 'initSync',
    value: function () {
      var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
        var access_token_cached, access_token_secret_cached, revoke_token_cached, appid_cached, appkey_cached, appsecret_cached, should_revoke, resp, revoke_text;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                this._storage = new _CStorage.CMMC_Storage(this.appid);
                access_token_cached = this._storage.get(_CStorage.CMMC_Storage.KEY_ACCESS_TOKEN);
                access_token_secret_cached = this._storage.get(_CStorage.CMMC_Storage.KEY_ACCESS_TOKEN_SECRET);
                revoke_token_cached = this._storage.get(_CStorage.CMMC_Storage.KEY_REVOKE_TOKEN);
                appid_cached = this._storage.get(_CStorage.CMMC_Storage.KEY_APP_ID);
                appkey_cached = this._storage.get(_CStorage.CMMC_Storage.KEY_APP_KEY);
                appsecret_cached = this._storage.get(_CStorage.CMMC_Storage.KEY_APP_SECRET);
                should_revoke = this.appid !== appid_cached || this.appkey !== appkey_cached || this.appsecret !== appsecret_cached && appid_cached && appkey_cached && appsecret_cached;

                if (!(false && should_revoke)) {
                  _context5.next = 25;
                  break;
                }

                Util.log('[CACHED] => ' + access_token_cached + ' - ' + access_token_secret_cached + ', ' + revoke_token_cached);
                Util.log('REVOKE URL = ' + gearauthurl + '/api/revoke/' + access_token_cached + '/' + revoke_token_cached);
                _context5.prev = 11;
                _context5.next = 14;
                return this.buildRequestObject('/api/revoke/' + access_token_cached + '/' + revoke_token_cached, 'GET').request(function () {});

              case 14:
                resp = _context5.sent;
                _context5.next = 17;
                return resp.text();

              case 17:
                revoke_text = _context5.sent;

                Util.log('REVOKE RESPONSE = ' + revoke_text);
                if (revoke_text === 'SUCCESS') {
                  this._storage.clear();
                }
                _context5.next = 25;
                break;

              case 22:
                _context5.prev = 22;
                _context5.t0 = _context5['catch'](11);

                Util.log('ERROR', _context5.t0);

              case 25:

                this.initilized = true;
                return _context5.abrupt('return', this);

              case 27:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this, [[11, 22]]);
      }));

      function initSync() {
        return _ref7.apply(this, arguments);
      }

      return initSync;
    }()
  }, {
    key: 'prepare',
    value: function prepare(config) {
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
    key: 'extract',
    value: function extract(response) {
      var arr = response.split('&');
      return arr.reduce(function (acc, v) {
        var _v$split = v.split('='),
            _v$split2 = (0, _slicedToArray3.default)(_v$split, 2),
            key = _v$split2[0],
            value = _v$split2[1];

        acc[key] = value;
        return acc;
      }, {});
    }
  }, {
    key: 'request',
    value: function () {
      var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(data, header_authorization_fn) {
        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                return _context6.abrupt('return', fetch(data.url, {
                  method: data.method,
                  timeout: 5000,
                  headers: {
                    'Authorization': header_authorization_fn.apply(this, [data])
                  }
                }));

              case 1:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function request(_x2, _x3) {
        return _ref8.apply(this, arguments);
      }

      return request;
    }()
  }, {
    key: 'buildRequestObject',
    value: function buildRequestObject(uri) {
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
        request: function request(header_authorization_fn) {
          return _this2.request(ret.object(), header_authorization_fn);
        }
      };
      return ret;
    }
  }]);
  return NetpieAuth;
}();