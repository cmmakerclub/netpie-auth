'use strict';

var _mg = require('./mg');

var fetch = require('node-fetch');
var CryptoJS = require("crypto-js");

var appid = "SmartTrash";

var appkey = "5yixIOa4YKKqo71";
var appsecret = "Gheh9qic46D99VFIchMfcMwQc";

var netpie = new _mg.NetpieOAuth({ appid: appid, appkey: appkey, appsecret: appsecret });
// console.log("NETPIE", netpie)


netpie.OAuthGetRequestToken().then(function (response_object) {
  var oauth_token = response_object.oauth_token,
      oauth_token_secret = response_object.oauth_token_secret,
      endpoint = response_object.endpoint,
      flag = response_object.flag;


  var hkey = oauth_token_secret + '&' + appsecret;
  var mqttusername = appkey;
  var mqttpassword = CryptoJS.HmacSHA1(oauth_token + '%' + mqttusername, hkey).toString(CryptoJS.enc.Base64);
  var b = endpoint.substr(6).split(':');
  console.log("B:", b);
  console.log("endpoint:", endpoint);
  console.log("flag:", flag);

  var revokecode = CryptoJS.HmacSHA1(oauth_token, hkey).toString(CryptoJS.enc.Base64).replace(/\//g, '_');
  console.log("REVOKE CODE =", revokecode);

  // // console.log(hkey, mqttusername, b);
  var command_t = 'mosquitto_sub -t "/' + appid + '/gearname/#" -h gb.netpie.io -i ' + oauth_token + ' -u "' + mqttusername + '" -P "' + mqttpassword + '" -d';
  console.log(command_t);
}).catch(function (ex) {
  console.log("ERROR:>>", ex);
});