let CryptoJS = require("crypto-js");

export let Util = {
  base64: (text) => text.toString(CryptoJS.enc.Base64),
  hmac: (text, key) => Util.base64(CryptoJS.HmacSHA1(text, key)),
  compute_hkey: (access_token_secret, app_secret) => `${access_token_secret}&${app_secret}`,
  compute_mqtt_password: (access_token, mqttusername, hkey) => Util.hmac(`${access_token}%${mqttusername}`, hkey),
  compute_revoke_code: (access_token, hkey) => Util.hmac(access_token, hkey).replace(/\//g, '_')
}
