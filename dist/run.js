'use strict';

var _mg = require('./mg');

var _storage = require('./storage');

var fetch = require('node-fetch');
var CryptoJS = require("crypto-js");

var appid = "Goose";
var appkey = "wdgGaeLQ6JPSkBA";
var appsecret = "r35kB6FoQqfSj7IHGifQIbN2h";

var netpie = new _mg.NetpieOAuth({ appid: appid, appkey: appkey, appsecret: appsecret });

var s2 = new _storage.CMMC_Storage(appid);

// s2.set(CMMC_Storage.KEY_OAUTH_REQUEST_TOKEN, 'world');
// s2.commit();
// CMMC_Storage.STATE.STATE_ACCESS_TOKEN

// console.log("GET = ", s2.get(CMMC_Storage.KEY_OAUTH_REQUEST_TOKEN));
netpie.OAuthGetRequestToken().then(function (response_object) {
  var oauth_token = response_object.oauth_token,
      oauth_token_secret = response_object.oauth_token_secret,
      endpoint = response_object.endpoint,
      flag = response_object.flag;
  //
  //   var hkey = oauth_token_secret + '&' + appsecret;
  //   var mqttusername = appkey;
  //   var mqttpassword = CryptoJS.HmacSHA1(oauth_token + '%' +
  //     mqttusername, hkey).toString(CryptoJS.enc.Base64);
  //   var b = endpoint.substr(6).split(':');
  //   console.log("B:", b)
  //   console.log("endpoint:", endpoint)
  //   console.log("flag:", flag)
  //
  //   var revokecode = CryptoJS.HmacSHA1(oauth_token, hkey).toString(CryptoJS.enc.Base64).replace(/\//g, '_');
  //   console.log("REVOKE CODE =", revokecode);
  //
  //
  //   // // console.log(hkey, mqttusername, b);
  //   let command_t = `mosquitto_sub -t "/${appid}/gearname/#" -h gb.netpie.io -i ${oauth_token} -u "${mqttusername}" -P "${mqttpassword}" -d`;
  //   console.log(command_t);
}).catch(function (ex) {
  console.log("ERROR:>>", ex);
});