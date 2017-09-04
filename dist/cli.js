'use strict';

var _NetpieAuth = require('./NetpieAuth');

var _cliTable = require('cli-table');

var _cliTable2 = _interopRequireDefault(_cliTable);

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _clear = require('clear');

var _clear2 = _interopRequireDefault(_clear);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _figlet = require('figlet');

var _figlet2 = _interopRequireDefault(_figlet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var configStore = require('./Configstore');
var pkg = require('../package.json');
var program = require('commander');
program.usage('[options]').version(pkg.version).option('-i, --id <required>', 'netpie appId').option('-k, --key <required>', 'netpie appKey').option('-s, --secret <required>', 'netpie appSecret').option('-j, --json-only [optional]>', 'output as json format').option('-z, --show-sed-command [optional]>', 'show sed command');

program.parse(process.argv);

function showFiglet() {
  (0, _clear2.default)();
  console.log(_chalk2.default.magenta(_figlet2.default.textSync(require('../package.json').name, { horizontalLayout: 'full' })));
}

var validateNotNull = function validateNotNull(input) {
  if (input) {
    return true;
  } else {
    return 'input must be filled.';
  }
};

var connectNetpie = function connectNetpie() {
  var appid = configStore.get('id');
  var appkey = configStore.get('key');
  var appsecret = configStore.get('secret');

  var head = ['Username', 'Password', 'ClientId', 'Prefix', 'Host', 'Port'];
  var table = new _cliTable2.default({ head: head, style: { head: ['green'] } });

  var netpie = new _NetpieAuth.NetpieAuth({ appid: appid, appkey: appkey, appsecret: appsecret });
  netpie.getMqttAuth(function (mqtt) {
    console.log('mqtt => ', mqtt);
    table.push([mqtt.username, mqtt.password, mqtt.client_id, mqtt.prefix, mqtt.host, mqtt.port]);
    var username = mqtt.username,
        password = mqtt.password,
        client_id = mqtt.client_id,
        prefix = mqtt.prefix,
        host = mqtt.host,
        port = mqtt.port;


    if (program.jsonOnly) {
      console.log(mqtt);
    } else {
      if (program.showSedCommand) {
        var sedCommand = 'NETPIE_APP_ID=' + appid + ' \nMQTT_USERNAME=' + username + '\nMQTT_PASSWORD=' + password + '\nMQTT_CLIENT_ID=' + client_id + '\nTOPIC_PREFIX="\\\\/$NETPIE_APP_ID\\\\/gearname \\\\/$NETPIE_APP_ID\\\\/gearname"\nsed -Ei "s/remote_username (.+)/remote_username $MQTT_USERNAME/g" $HOME/mosquitto-conf/config/conf.d/bridges.conf\nsed -Ei "s/remote_password (.+)/remote_password $MQTT_PASSWORD/g" $HOME/mosquitto-conf/config/conf.d/bridges.conf\nsed -Ei "s/remote_clientid (.+)/remote_clientid $MQTT_CLIENT_ID/g" $HOME/mosquitto-conf/config/conf.d/bridges.conf\nsed -Ei "s/\\\\/(.+)\\\\/gearname/$TOPIC_PREFIX/g" $HOME/mosquitto-conf/config/conf.d/bridges.conf';
        console.log(sedCommand);
      }
      console.log(table.toString());
      console.log('mosquitto_sub -t "' + prefix + '/#" -h ' + host + ' -i ' + client_id + ' -u "' + username + '" -P "' + password + '" -p ' + port + ' -d');
    }
  }).catch(function (error) {
    console.error(error.message);
  });
};

showFiglet();
var displayInquirer = function displayInquirer(callback) {
  var questions = [{
    type: 'input',
    name: 'id',
    default: configStore.get('id'),
    validate: validateNotNull,
    message: 'Netpie app id'
  }, {
    type: 'input',
    name: 'key',
    default: configStore.get('key'),
    message: 'Netpie app key'
  }, {
    type: 'input',
    name: 'secret',
    default: configStore.get('secret'),
    message: 'Netpie app secret'
  }];

  _inquirer2.default.prompt(questions).then(callback);
};

if (!program.id || !program.key || !program.secret) {
  displayInquirer(function (ans) {
    configStore.set('id', ans.id);
    configStore.set('key', ans.key);
    configStore.set('secret', ans.secret);
    connectNetpie();
  });
} else {
  configStore.set('id', program.id);
  configStore.set('key', program.key);
  configStore.set('secret', program.secret);
  connectNetpie();
}