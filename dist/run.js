'use strict';

var _NetpieAuth = require('./NetpieAuth');

var appid = 'CMMCIO';
var appkey = 'NhPwKvkJFLXYGfd';
var appsecret = 'G5mY73QQK18g9js7ffDJnJt4t';

var netpie = new _NetpieAuth.NetpieAuth({ appid: appid, appkey: appkey, appsecret: appsecret });
netpie.initSync();
netpie.getMqttAuth(function (mqttAuthStruct) {
  console.log('auth structure', mqttAuthStruct);
  var username = mqttAuthStruct.username,
      password = mqttAuthStruct.password,
      client_id = mqttAuthStruct.client_id,
      prefix = mqttAuthStruct.prefix,
      host = mqttAuthStruct.host,
      port = mqttAuthStruct.port;

  console.log('mosquitto_sub -t "' + prefix + '/#" -h ' + host + ' -i ' + client_id + ' -u "' + username + '" -P "' + password + '" -p ' + port + ' -d');
}).then(function (response) {
  console.log('18', response);
});