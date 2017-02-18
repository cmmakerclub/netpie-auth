import {
  NetpieAuth
} from './NetpieAuth'

const appid = "Goose";
const appkey = "AG6DU09xNIMGg9O";
const appsecret = "dO19OpEZ6DECWjzNBAO4EgmSr";

let netpie = new NetpieAuth({appid: appid, appkey: appkey, appsecret: appsecret});

console.log("initializing...")
try {
  netpie.getMqttAuth((mqtt_auth_struct) => {
    let {username, password, client_id, prefix, host, port} = mqtt_auth_struct;
    console.log(host);

    console.log(`mosquitto_sub -t "${prefix}/#" -h ${host} -i ${client_id} -u "${username}" -P "${password}" -p ${port} -d`);
  })

}
catch (err) {

  console.log("ERRR>>", err);
}
