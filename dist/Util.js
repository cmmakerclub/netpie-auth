'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var CryptoJS = require('crypto-js');

var Util = exports.Util = {
  debug: function debug() {
    // console.log.apply(console, args)
  },
  log: function log() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    console.log.apply(console, args);
  },
  base64: function base64(text) {
    return text.toString(CryptoJS.enc.Base64);
  },
  hmac: function hmac(text, key) {
    return Util.base64(CryptoJS.HmacSHA1(text, key));
  },
  compute_hkey: function compute_hkey(access_token_secret, app_secret) {
    return access_token_secret + '&' + app_secret;
  },
  compute_mqtt_password: function compute_mqtt_password(access_token, mqttusername, hkey) {
    return Util.hmac(access_token + '%' + mqttusername, hkey);
  },
  compute_revoke_code: function compute_revoke_code(access_token, hkey) {
    return Util.hmac(access_token, hkey).replace(/\//g, '_');
  }
};