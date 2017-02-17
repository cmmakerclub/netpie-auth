import {
  NetpieAuth
} from './mg'

import {CMMC_Storage} from './storage'

import './Util'

let fetch = require('node-fetch');
let CryptoJS = require("crypto-js");

const appid = "Goose";
const appkey = "AG6DU09xNIMGg9O";
const appsecret = "dO19OpEZ6DECWjzNBAO4EgmSr";

let netpie = new NetpieAuth({appid: appid, appkey: appkey, appsecret: appsecret});


try {
  netpie.getMqttAuth((mqtt_auth_struct) => {
    let {username, password, clientId, prefix} = mqtt_auth_struct;
  })
}
catch (err) {
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

