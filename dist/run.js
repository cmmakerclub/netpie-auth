'use strict';

var _NetpieAuth = require('./NetpieAuth');

var appid = 'CMMCIO';
var appkey = 'NhPwKvkJFLXYGfd';
var appsecret = 'G5mY73QQK18g9js7ffDJnJt4t';

var netpie = new _NetpieAuth.NetpieAuth({ appid: appid, appkey: appkey, appsecret: appsecret });

netpie.getMqttAuth(function (mqttAuthStruct) {
  Object.keys(mqttAuthStruct).forEach(function (key, idx) {
    console.log(key + ' => ' + mqttAuthStruct[key]);
  });
  // console.log('auth structure', mqttAuthStruct)
  // let {username, password, client_id, prefix, host, port} = mqttAuthStruct
  // console.log(`mosquitto_sub -t "${prefix}/#" -h ${host} -i ${client_id} -u "${username}" -P "${password}" -p ${port} -d`)
});