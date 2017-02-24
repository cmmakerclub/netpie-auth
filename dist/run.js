"use strict";

var _NetpieAuth = require("./NetpieAuth");

var appid = "Goose";
var appkey = "XGzqs1swIiSVnqZ";
var appsecret = "jqrp2YNPhJQwbFCjXhdd6Pm66";

var netpie_auth = new _NetpieAuth.NetpieAuth({ appid: appid, appkey: appkey, appsecret: appsecret });

console.log("initializing...");
netpie_auth.initSync();
netpie_auth.getMqttAuth(function (mqtt_auth_struct) {
  console.log("auth structure", mqtt_auth_struct);
  var username = mqtt_auth_struct.username,
      password = mqtt_auth_struct.password,
      client_id = mqtt_auth_struct.client_id,
      prefix = mqtt_auth_struct.prefix,
      host = mqtt_auth_struct.host,
      port = mqtt_auth_struct.port;

  console.log("mosquitto_sub -t \"" + prefix + "/#\" -h " + host + " -i " + client_id + " -u \"" + username + "\" -P \"" + password + "\" -p " + port + " -d");
}).then(function (response) {
  console.log("18", response);
});