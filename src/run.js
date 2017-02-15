import {
  NetpieOAuth
} from './mg'

let fetch = require('node-fetch');
let CryptoJS = require("crypto-js");

const appid = "Goose";
const appkey = "JjuBAqMcq9UV0s9";
const appsecret = "BY5SwTWC5aBKgL8qt6VMHJ9W5";

let netpie = new NetpieOAuth({appid: appid, appkey: appkey, appsecret: appsecret});
// console.log("NETPIE", netpie)


netpie.OAuthGetRequestToken().then((response_object) => {
  let {oauth_token, oauth_token_secret, endpoint, flag} = response_object

  var hkey = oauth_token_secret + '&' + appsecret;
  var mqttusername = appkey;
  var mqttpassword = CryptoJS.HmacSHA1(oauth_token + '%' +
    mqttusername, hkey).toString(CryptoJS.enc.Base64);
  var b = endpoint.substr(6).split(':');
  console.log("B:", b)
  console.log("endpoint:", endpoint)
  console.log("flag:", flag)

  var revokecode = CryptoJS.HmacSHA1(oauth_token, hkey).toString(CryptoJS.enc.Base64).replace(/\//g, '_');
  console.log("REVOKE CODE =", revokecode);


  // // console.log(hkey, mqttusername, b);
  let command_t = `mosquitto_sub -t "/${appid}/gearname/#" -h gb.netpie.io -i ${oauth_token} -u "${mqttusername}" -P "${mqttpassword}" -d`;
  console.log(command_t);
}).catch(function (ex) {
  console.log("ERROR:>>", ex);
});

