import {
  NetpieAuth
} from './NetpieAuth'

const appid = "Goose";
const appkey = "xPuYksxVJSSAxnOT";
const appsecret = "8cuZpXrYyIOquwtJRAzSNI8yc";

let netpie = new NetpieAuth({appid: appid, appkey: appkey, appsecret: appsecret});
console.log("initializing...")

try {
  setTimeout(() => {
    netpie.getMqttAuth((mqtt_auth_struct) => {
      console.log("auth structure", mqtt_auth_struct)
      let {username, password, client_id, prefix, host, port} = mqtt_auth_struct;
      console.log(`mosquitto_sub -t "${prefix}/#" -h ${host} -i ${client_id} -u "${username}" -P "${password}" -p ${port} -d`);
    })
  }, 500)
}
catch (err) {
  console.error(err);
}
