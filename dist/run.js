'use strict';

var _mg = require('./mg');

require('./Util');

var appid = "Goose";
var appkey = "AG6DU09xNIMGg9O";
var appsecret = "dO19OpEZ6DECWjzNBAO4EgmSr";

var netpie = new _mg.NetpieAuth({ appid: appid, appkey: appkey, appsecret: appsecret });

try {
  netpie.getMqttAuth(function (mqtt_auth_struct) {
    var username = mqtt_auth_struct.username,
        password = mqtt_auth_struct.password,
        client_id = mqtt_auth_struct.client_id,
        prefix = mqtt_auth_struct.prefix;

    console.log(mqtt_auth_struct);
    var command_t = 'mosquitto_sub -t "' + prefix + '/#" -h gb.netpie.io -i ' + client_id + ' -u "' + username + '" -P "' + password + '" -d';
    console.log(command_t);
  });
} catch (err) {
  console.log("ERRR>>", err);
}