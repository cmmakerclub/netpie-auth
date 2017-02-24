import {
  NetpieAuth
} from './NetpieAuth'

const appid = "Goose";
const appkey = "XGzqs1swIiSVnqZ";
const appsecret = "jqrp2YNPhJQwbFCjXhdd6Pm66";

let netpie_auth = new NetpieAuth({appid: appid, appkey: appkey, appsecret: appsecret});

console.log("initializing...")
netpie_auth.initSync();
netpie_auth.getMqttAuth((mqtt_auth_struct) => {
  console.log("auth structure", mqtt_auth_struct)
  let {username, password, client_id, prefix, host, port} = mqtt_auth_struct;
  console.log(`mosquitto_sub -t "${prefix}/#" -h ${host} -i ${client_id} -u "${username}" -P "${password}" -p ${port} -d`);
}).then((response) => {
  console.log("18", response)
})



