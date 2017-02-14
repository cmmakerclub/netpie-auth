'use strict';

var _mg = require('./mg');

var fetch = require('node-fetch');
var CryptoJS = require("crypto-js");

console.log('fetch');

var appid = "Goose";
var appkey = "sQZ7eiEVQHYDpms";
var appsecret = "SeLz8M5RclOnIrNvspwqDeIQx";

console.log("HELLO");
var netpie = new _mg.NetpieOAuth({ appid: appid, appkey: appkey, appsecret: appsecret });
console.log("NETPIE", netpie);

netpie.OAuthGetRequestToken().then(function (response_object) {
  console.log(">>>>> text", response_object);
  var oauth_token = response_object.oauth_token,
      oauth_token_secret = response_object.oauth_token_secret,
      endpoint = response_object.endpoint,
      flag = response_object.flag;


  var hkey = oauth_token_secret + '&' + appsecret;
  var mqttusername = appkey;
  var mqttpassword = CryptoJS.HmacSHA1(oauth_token + '%' + mqttusername, hkey).toString(CryptoJS.enc.Base64);
  var b = endpoint.substr(6).split(':');
  // // console.log(hkey, mqttusername, b);
  var command_t = 'mosquitto_sub -t "/' + appid + '/gearname/#" -h gb.netpie.io -i ' + oauth_token + ' -u "' + mqttusername + '" -P "' + mqttpassword + '" -d';
  console.log(command_t);
}).catch(function (ex) {

  console.log("ERROR:>>", ex);
});