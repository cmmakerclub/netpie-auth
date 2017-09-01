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
  .option('-i, --id <required>', 'netpie appId is required')
  .option('-k, --key <required>', 'netpie appKey')
  .option('-s, --secret <required>', 'netpie appSecret')

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
    // Object.keys(mqtt).forEach((key, idx) => {
    //   console.log(`${key} => ${mqtt[key]}`)
    // })
    table.push([mqtt.username, mqtt.password, mqtt.client_id, mqtt.prefix, mqtt.host, mqtt.port])
    console.log(table.toString())
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

