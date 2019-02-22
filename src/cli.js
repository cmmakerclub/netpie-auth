import { NetpieAuth } from './NetpieAuth';
import { DevicedData } from './DevicedData';
import Table from 'cli-table';
import inquirer from 'inquirer';
import clear from 'clear';
import chalk from 'chalk';
import figlet from 'figlet';

const configStore = require('./Configstore');
const fs = require('fs');
const pkg = require('../package.json');
const program = require('commander');
program
  .usage('[options]')
  .version(pkg.version)
  .option('-i, --id [optional]', 'netpie appId')
  .option('-k, --key [optional]', 'netpie appKey')
  .option('-s, --secret [optional]', 'netpie appSecret')
  .option('-j, --json-only [optional]', 'output as json format')
  .option('-m, --mosquitto-bridge-config', 'show mosquitto bridge conig')
  .option('-z, --show-sed-command [optional]', 'show sed command')
  .option('-l, --list', 'show list')


program.parse(process.argv);

function showFiglet () {
  clear();
  console.log(
    chalk.magenta(
      figlet.textSync(require('../package.json').name, {horizontalLayout: 'full'})
    )
  );
}

const validateNotNull = (input) => {
  if (input) {
    return true;
  }
  else {
    return 'input must be filled.';
  }
};

const connectNetpie = () => {
  const appid = configStore.get('id');
  const appkey = configStore.get('key');
  const appsecret = configStore.get('secret');

  const head = ['Username', 'Password', 'ClientId', 'Prefix', 'Host', 'Port'];
  const table = new Table({head, style: {head: ['green']}});

  const netpie = new NetpieAuth({appid, appkey, appsecret});
  netpie.getMqttAuth((mqtt) => {
    table.push([mqtt.username, mqtt.password, mqtt.client_id, mqtt.prefix, mqtt.host, mqtt.port]);
    let {username, password, client_id, prefix, host, port} = mqtt;

    const deviceData = new DevicedData();
    var useDir = deviceData.UserDir();

    var configFolder = useDir;
    var appID = appid;
    var configFileName = deviceData.Prefix() + appID + ".json";
    var fullFilePath = configFolder + "/" + configFileName;

    var key = appkey;
    var secret = appsecret;

    if (fs.existsSync(configFolder) == false) 
    {
      fs.mkdirSync(configFolder);
    }

    if (fs.existsSync(fullFilePath) == false) 
    {
      var initData = {};
      initData[appID] = {};

      var newAppData = {};
      newAppData.key = key;
      newAppData.secret = secret;
      newAppData.data = [];

      initData[appID][key] = newAppData;

      fs.writeFileSync(fullFilePath, JSON.stringify(initData, null, 4), 'utf8');
    }

    var saveData = fs.readFileSync(fullFilePath ,'utf8');
    saveData = JSON.parse(saveData);

    var newDevice = {};
    newDevice.Username = mqtt.username;
    newDevice.Password = mqtt.password;
    newDevice.ClientId = mqtt.client_id;
    newDevice.Prefix = mqtt.prefix;
    newDevice.Host = mqtt.host;
    newDevice.Port = mqtt.port;

    if (typeof saveData[appID][key] == "undefined")
    {
      var newAppData = {};
      newAppData.key = key;
      newAppData.secret = secret;
      newAppData.data = [];
      saveData[appID][key] = newAppData;
    }

    saveData[appID][key].data.push(newDevice);

    fs.writeFileSync(fullFilePath, JSON.stringify(saveData, null, 4), 'utf8');

    if (program.jsonOnly) {
      console.log(mqtt);
    }
    else {
      if (program.showSedCommand) {
        const sedCommand = `export NETPIE_APP_ID=${appid} 
export MQTT_USERNAME=${username}
export MQTT_PASSWORD=${password.replace('/', '\\/')}
export MQTT_CLIENT_ID=${client_id}
export TOPIC_PREFIX="\\\\/$NETPIE_APP_ID\\\\/gearname\\/ \\\\/$NETPIE_APP_ID\\\\/gearname\\/"
sed -Ei "s/remote_username (.+)/remote_username $MQTT_USERNAME/g" $HOME/mosquitto-conf/config/conf.d/bridges.conf
sed -Ei "s/remote_password (.+)/remote_password $MQTT_PASSWORD/g" $HOME/mosquitto-conf/config/conf.d/bridges.conf
sed -Ei "s/remote_clientid (.+)/remote_clientid $MQTT_CLIENT_ID/g" $HOME/mosquitto-conf/config/conf.d/bridges.conf
sed -Ei "s/\\\\/(.+)\\\\/gearname\\//$TOPIC_PREFIX/g" $HOME/mosquitto-conf/config/conf.d/bridges.conf`;
        console.log(sedCommand);
      } else if (program.mosquittoBridgeConfig) {
        console.log('mosquitto bridge config');
      }
      else {
        console.log(table.toString());
        console.log(`mosquitto_sub -t "${prefix}#" -h ${host} -i ${client_id} -u "${username}" -P "${password}" -p ${port} -d`);
      }
    }
  }).catch((error) => {
    console.error(error.message);
  });
};

showFiglet();
const preId = program.id;
const preKey = program.key;
const preSecret = program.secret;

const displayInquirer = (callback) => {
  var questions = [
    {
      type: 'input',
      name: 'id',
      default: preId || configStore.get('id'),
      validate: validateNotNull,
      message: 'Netpie app id'
    },
    {
      type: 'input',
      name: 'key',
      validate: validateNotNull,
      default: preKey || configStore.get('key'),
      message: 'Netpie app key'
    },
    {
      type: 'input',
      name: 'secret',
      validate: validateNotNull,
      default: preSecret || configStore.get('secret'),
      message: 'Netpie app secret'
    },
  ];

  inquirer.prompt(questions).then(callback);

};

if (program.list) {

  const deviceData = new DevicedData();
  var list = deviceData.getList();

  for (var i = 0; i < list.length; i++)
  {
    // app
    var appID = Object.keys(list[i])[0];
    console.log("App ID:\t\t" + appID)
    
    for (var k = 0; k < Object.keys(list[i][appID]).length; k++)
    {
      var appKey = Object.keys(list[i][appID])[k]
      var appSecret = list[i][appID][appKey].secret
      var data = list[i][appID][appKey].data;
      
      console.log("App Key:\t" + appKey)
      console.log("Aapp Secret:\t" + appSecret)

      const head = ['Username', 'Password', 'ClientId', 'Prefix', 'Host', 'Port'];
      const table = new Table({head, style: {head: ['green']}});

      for (var j = 0; j < data.length; j++)
      {
        table.push([data[j].Username, data[j].Password, data[j].ClientId, data[j].Prefix, data[j].Host, data[j].Port]);
      }

      console.log(table.toString());
    }
  }

  if (list.length == 0)
  {
    console.log("Empty");
  }

}
else if (!program.id || !program.key || !program.secret) {
  displayInquirer((ans) => {
    configStore.set('id', ans.id);
    configStore.set('key', ans.key);
    configStore.set('secret', ans.secret);
    connectNetpie();
  });
}
else {
  configStore.set('id', program.id);
  configStore.set('key', program.key);
  configStore.set('secret', program.secret);
  connectNetpie();
}
