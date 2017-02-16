'use strict';

var _mg = require('./mg');

var _storage = require('./storage');

var fetch = require('node-fetch');
var CryptoJS = require("crypto-js");

var appid = "Goose";
var appkey = "wdgGaeLQ6JPSkBA";
var appsecret = "r35kB6FoQqfSj7IHGifQIbN2h";

var netpie = new _mg.NetpieOAuth({ appid: appid, appkey: appkey, appsecret: appsecret });

var compute_hkey = function compute_hkey(access_token_secret, app_secret) {
  return access_token_secret + '&' + app_secret;
};
var compute_mqtt_password = function compute_mqtt_password(access_token, mqttusername, hkey) {
  return CryptoJS.HmacSHA1(access_token + '%' + mqttusername, hkey).toString(CryptoJS.enc.Base64);
};
var compute_revoke_code = function compute_revoke_code(access_token, hkey) {
  return CryptoJS.HmacSHA1(access_token, hkey).toString(CryptoJS.enc.Base64).replace(/\//g, '_');
};

netpie.getToken().then(function (token) {
  var oauth_token = token.oauth_token,
      oauth_token_secret = token.oauth_token_secret,
      endpoint = token.endpoint,
      flag = token.flag;

  var hkey = compute_hkey(oauth_token_secret, appsecret);
  var mqttusername = appkey;
  var mqttpassword = compute_mqtt_password(oauth_token, mqttusername, hkey);
  var revoke_code = compute_revoke_code(oauth_token, hkey);

  var command_t = 'mosquitto_sub -t "/' + appid + '/gearname/#" -h gb.netpie.io -i ' + oauth_token + ' -u "' + mqttusername + '" -P "' + mqttpassword + '" -d';

  console.log('' + command_t);
  console.log('revoke code = ' + revoke_code);
}).catch(function (ex) {
  console.log("CMMC_ERROR:>>", ex);
});