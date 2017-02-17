"use strict";

var _NetpieAuth = require("./NetpieAuth");

var appid = "Goose";
var appkey = "AG6DU09xNIMGg9O";
var appsecret = "dO19OpEZ6DECWjzNBAO4EgmSr";

var netpie = new _NetpieAuth.NetpieAuth({ appid: appid, appkey: appkey, appsecret: appsecret });

try {
  netpie.getMqttAuth(function (mqtt_auth_struct) {
    var username = mqtt_auth_struct.username,
        password = mqtt_auth_struct.password,
        client_id = mqtt_auth_struct.client_id,
        prefix = mqtt_auth_struct.prefix,
        host = mqtt_auth_struct.host,
        port = mqtt_auth_struct.port;

    console.log(host);
    console.log("mosquitto_sub -t \"" + prefix + "/#\" -h " + host + " -i " + client_id + " -u \"" + username + "\" -P \"" + password + "\" -p " + port + " -d");
  });
} catch (err) {
  console.log("ERRR>>", err);
}