import { NetpieAuth } from './NetpieAuth'
import Table from 'cli-table'
import inquirer from 'inquirer'
import clear from 'clear'
import chalk from 'chalk'
import figlet from 'figlet'

const configStore = require('./Configstore')
const pkg = require('../package.json')
const program = require('commander')
program
  .usage('[options]')
  .version(pkg.version)
  .option('-i, --id <required>', 'netpie appId')
  .option('-k, --key <required>', 'netpie appKey')
  .option('-s, --secret <required>', 'netpie appSecret')
  .option('-j, --json-only [optional]>', 'output as json format')
  .option('-z, --show-sed-command [optional]>', 'show sed command')

program.parse(process.argv)

function showFiglet () {
  clear()
  console.log(
    chalk.magenta(
      figlet.textSync(require('../package.json').name, {horizontalLayout: 'full'})
    )
  )
}

const validateNotNull = (input) => {
  if (input) {
    return true
  }
  else {
    return 'input must be filled.'
  }
}

const connectNetpie = () => {
  const appid = configStore.get('id')
  const appkey = configStore.get('key')
  const appsecret = configStore.get('secret')

  const head = ['Username', 'Password', 'ClientId', 'Prefix', 'Host', 'Port']
  const table = new Table({head, style: {head: ['green']}})

  const netpie = new NetpieAuth({appid, appkey, appsecret})
  netpie.getMqttAuth((mqtt) => {
    console.log('mqtt => ', mqtt)
    table.push([mqtt.username, mqtt.password, mqtt.client_id, mqtt.prefix, mqtt.host, mqtt.port])
    let {username, password, client_id, prefix, host, port} = mqtt

    if (program.jsonOnly) {
      console.log(mqtt)
    }
    else {
      if (program.showSedCommand) {
        const sedCommand = `NETPIE_APP_ID=${appid} 
MQTT_USERNAME=${username}
MQTT_PASSWORD=${password}
MQTT_CLIENT_ID=${client_id}
TOPIC_PREFIX="\\\\/$NETPIE_APP_ID\\\\/gearname \\\\/$NETPIE_APP_ID\\\\/gearname"
sed -Ei "s/remote_username (.+)/remote_username $MQTT_USERNAME/g" $HOME/mosquitto-conf/config/conf.d/bridges.conf
sed -Ei "s/remote_password (.+)/remote_password $MQTT_PASSWORD/g" $HOME/mosquitto-conf/config/conf.d/bridges.conf
sed -Ei "s/remote_clientid (.+)/remote_clientid $MQTT_CLIENT_ID/g" $HOME/mosquitto-conf/config/conf.d/bridges.conf
sed -Ei "s/\\\\/(.+)\\\\/gearname/$TOPIC_PREFIX/g" $HOME/mosquitto-conf/config/conf.d/bridges.conf`
        console.log(sedCommand)
      }
      console.log(table.toString())
      console.log(`mosquitto_sub -t "${prefix}/#" -h ${host} -i ${client_id} -u "${username}" -P "${password}" -p ${port} -d`)
    }
  }).catch((error) => {
    console.error(error.message)
  })
}

showFiglet()
const displayInquirer = (callback) => {
  var questions = [
    {
      type: 'input',
      name: 'id',
      default: configStore.get('id'),
      validate: validateNotNull,
      message: 'Netpie app id'
    },
    {
      type: 'input',
      name: 'key',
      default: configStore.get('key'),
      message: 'Netpie app key'
    },
    {
      type: 'input',
      name: 'secret',
      default: configStore.get('secret'),
      message: 'Netpie app secret'
    },
  ]

  inquirer.prompt(questions).then(callback)

}

if (!program.id || !program.key || !program.secret) {
  displayInquirer((ans) => {
    configStore.set('id', ans.id)
    configStore.set('key', ans.key)
    configStore.set('secret', ans.secret)
    connectNetpie()
  })
}
else {
  configStore.set('id', program.id)
  configStore.set('key', program.key)
  configStore.set('secret', program.secret)
  connectNetpie()
}

