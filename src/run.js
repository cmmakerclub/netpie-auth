import {
  NetpieAuth
} from './mg'

import './Util'

const appid = "Goose";
const appkey = "AG6DU09xNIMGg9O";
const appsecret = "dO19OpEZ6DECWjzNBAO4EgmSr";

let netpie = new NetpieAuth({appid: appid, appkey: appkey, appsecret: appsecret});

try {
  netpie.getMqttAuth((mqtt_auth_struct) => {
    let {username, password, client_id, prefix} = mqtt_auth_struct;
    console.log(mqtt_auth_struct);
    let command_t = `mosquitto_sub -t "${prefix}/#" -h gb.netpie.io -i ${client_id} -u "${username}" -P "${password}" -d`;
    console.log(command_t)
  })
}
catch (err) {
  console.log("ERRR>>", err);
} 
