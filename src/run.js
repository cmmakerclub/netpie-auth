import {
  NetpieAuth
} from './mg'

import {CMMC_Storage} from './storage'

let fetch = require('node-fetch');
let CryptoJS = require("crypto-js");

const appid = "Goose";
const appkey = "O7uO7woDfvgooFJ";
const appsecret = "yvY8Pmx2hy5Wqx9d792lofsNE";

let netpie = new NetpieAuth({appid: appid, appkey: appkey, appsecret: appsecret});

let Util = {
  hmac: (text, key) => Util.base64(CryptoJS.HmacSHA1(text, key)),
  base64: (text) => text.toString(CryptoJS.enc.Base64)
}

let compute_hkey = (access_token_secret, app_secret) => `${access_token_secret}&${app_secret}`
let compute_mqtt_password = (access_token, mqttusername, hkey) => Util.hmac(`${access_token}%${mqttusername}`, hkey)
let compute_revoke_code = (access_token, hkey) => Util.hmac(access_token, hkey).replace(/\//g, '_');

netpie.getToken().then((token) => {
  let {oauth_token, oauth_token_secret, endpoint, flag} = token
  let hkey = compute_hkey(oauth_token_secret, appsecret)
  let mqttusername = `${appkey}%${Math.floor(Date.now() / 1000)}`;
  let mqttpassword = compute_mqtt_password(oauth_token, mqttusername, hkey)
  let revoke_code = compute_revoke_code(oauth_token, hkey)

  let command_t = `mosquitto_sub -t "/${appid}/gearname/#" -h gb.netpie.io -i ${oauth_token} -u "${mqttusername}" -P "${mqttpassword}" -d`;


  console.log(`revoke code = ${revoke_code}, endpoint = ${decodeURIComponent(endpoint)}`)
  console.log(`${command_t}`)
}).catch(function (ex) {
  console.log("CMMC_ERROR:>>", ex);
});

