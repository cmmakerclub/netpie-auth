import {
  NetpieOAuth
} from './mg'

let fetch = require('node-fetch');
let CryptoJS = require("crypto-js");

console.log('fetch');


const appid = "Goose";
const appkey = "sQZ7eiEVQHYDpms";
const appsecret = "SeLz8M5RclOnIrNvspwqDeIQx";


console.log("HELLO")
let netpie = new NetpieOAuth({appid: appid, appkey: appkey, appsecret: appsecret});
console.log("NETPIE", netpie)

netpie.OAuthGetRequestToken().then((response_object) => {
  console.log(">>>>> text", response_object)
  let {oauth_token, oauth_token_secret, endpoint, flag} = response_object

  var hkey = oauth_token_secret + '&' + appsecret;
  var mqttusername = appkey;
  var mqttpassword = CryptoJS.HmacSHA1(oauth_token + '%' +
    mqttusername, hkey).toString(CryptoJS.enc.Base64);
  var b = endpoint.substr(6).split(':');
  // // console.log(hkey, mqttusername, b);
  let command_t = `mosquitto_sub -t "/${appid}/gearname/#" -h gb.netpie.io -i ${oauth_token} -u "${mqttusername}" -P "${mqttpassword}" -d`;
  console.log(command_t);
}).catch(function (ex) {

  console.log("ERROR:>>", ex);
});

