'use strict';

var _mg = require('./mg');

var _storage = require('./storage');

require('./Util');

var fetch = require('node-fetch');
var CryptoJS = require("crypto-js");

var appid = "Goose";
var appkey = "AG6DU09xNIMGg9O";
var appsecret = "dO19OpEZ6DECWjzNBAO4EgmSr";

var netpie = new _mg.NetpieAuth({ appid: appid, appkey: appkey, appsecret: appsecret });

try {
  netpie.getMqttAuth(function (mqtt_auth_struct) {
    var username = mqtt_auth_struct.username,
        password = mqtt_auth_struct.password,
        clientId = mqtt_auth_struct.clientId,
        prefix = mqtt_auth_struct.prefix;
  });
} catch (err) {
  console.log("ERRR>>", err);
}

// netpie.getToken().then((token) => {
//   let {oauth_token, oauth_token_secret, endpoint, flag} = token
//
//   let hkey = Util.compute_hkey(oauth_token_secret, appsecret)
//   let mqttusername = `${appkey}%${Math.floor(Date.now() / 1000)}`;
//   let mqttpassword = Util.compute_mqtt_password(oauth_token, mqttusername, hkey)
//   let revoke_code = Util.compute_revoke_code(oauth_token, hkey)
//
//   let command_t = `mosquitto_sub -t "/${appid}/gearname/#" -h gb.netpie.io -i ${oauth_token} -u "${mqttusername}" -P "${mqttpassword}" -d`;
//
//
//   console.log(`revoke code = ${revoke_code}, endpoint = ${decodeURIComponent(endpoint)}`)
//   console.log(`${command_t}`)
// }).catch(function (ex) {
//   console.log("CMMC_ERROR:>>", ex);
// });