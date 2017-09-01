import { NetpieAuth } from './NetpieAuth'

const appid = 'CMMCIO'
const appkey = 'NhPwKvkJFLXYGfd'
const appsecret = 'G5mY73QQK18g9js7ffDJnJt4t'

let netpie = new NetpieAuth({appid: appid, appkey: appkey, appsecret: appsecret})

netpie.getMqttAuth((mqttAuthStruct) => {
  Object.keys(mqttAuthStruct).forEach((key, idx) => {
    console.log(`${key} => ${mqttAuthStruct[key]}`)
  })
  // console.log('auth structure', mqttAuthStruct)
  // let {username, password, client_id, prefix, host, port} = mqttAuthStruct
  // console.log(`mosquitto_sub -t "${prefix}/#" -h ${host} -i ${client_id} -u "${username}" -P "${password}" -p ${port} -d`)
})


