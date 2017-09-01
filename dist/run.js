'use strict';

var _NetpieAuth = require('./NetpieAuth');

var _cliTable = require('cli-table');

var _cliTable2 = _interopRequireDefault(_cliTable);

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var configStore = require('./Configstore');
var pkg = require('../package.json');
var program = require('commander');
program.usage('[options]').version(pkg.version).option('-i, --id <required>', 'netpie appId is required').option('-k, --key <required>', 'netpie appKey').option('-s, --secret <required>', 'netpie appSecret');

program.parse(process.argv);

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
    // Object.keys(mqtt).forEach((key, idx) => {
    //   console.log(`${key} => ${mqtt[key]}`)
    // })
    table.push([mqtt.username, mqtt.password, mqtt.client_id, mqtt.prefix, mqtt.host, mqtt.port]);
    console.log(table.toString());
  });
};

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