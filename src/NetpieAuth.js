var OAuth = require('oauth-1.0a');

let CryptoJS = require("crypto-js");
let fetch = require("node-fetch")
import {CMMC_Storage as Storage} from './storage'
import * as Helper from './Util'
let Util = Helper.Util

const VERSION = '1.0.9';
const GEARAPIADDRESS = 'ga.netpie.io';
const GEARAPIPORT = '8080';


const MGREV = 'NJS1a';

const gearauthurl = 'http://' + GEARAPIADDRESS + ':' + GEARAPIPORT;
let verifier = MGREV;


let log = (msg) => {
  console.log(msg);
}

export class NetpieAuth {
  constructor (props) {
    this.appid = props.appid
    this.appkey = props.appkey
    this.appsecret = props.appsecret
    this.create(props)
    // initialize this._storage
    log("30")
    this._storage = new Storage(this.appid)
  }


  getMqttAuth = async (callback) => {
    log(`getMqttAuth: `)
    console.log(this._storage);
    log("STATE = ", this._storage.get(Storage.KEY_STATE));
    if (this._storage.get(Storage.KEY_STATE) == Storage.STATE.STATE_ACCESS_TOKEN) {
      log(`STATE = ACCESS_TOKEN, RETRVING LAST VALUES...`)

      let [appkey, appsecret, appid] = [this.appkey, this.appsecret, this.appid]
      let [access_token, access_token_secret] = [this._storage.get(Storage.KEY_ACCESS_TOKEN),
        this._storage.get(Storage.KEY_ACCESS_TOKEN_SECRET)]

      let endpoint = decodeURIComponent(this._storage.get(Storage.KEY_ENDPOINT))
      let hkey = Util.compute_hkey(access_token_secret, appsecret)
      let mqttusername = `${appkey}%${Math.floor(Date.now() / 1000)}`;
      let mqttpassword = Util.compute_mqtt_password(access_token, mqttusername, hkey)
      let revoke_code = Util.compute_revoke_code(access_token, hkey)
      let [input, protocol, host, port] = endpoint.match(/^([a-z]+):\/\/([^:\/]+):(\d+)/)
      let matched = endpoint.match(/^([a-z]+):\/\/([^:\/]+):(\d+)/)
      let ret = {
        username: mqttusername,
        password: mqttpassword,
        client_id: access_token,
        prefix: `/${appid}/gearname`,
        appid: appid,
        host: host,
        port: port,
        endpoint: endpoint
      }
      log(54, "callback = ", callback)
      callback.apply(this, [ret]);
    }
    else {
      try {
        log("calling getToken")
        await this.getToken();
        log("getToken() done")
        var that = this;
        setTimeout(() => {
          console.log("WAITING.. 2s")
          return that.getMqttAuth(callback);
        }, 2000)
      }
      catch (err) {
        log(64)
        return null;
      }
    }
  }

  create (config) {
    this.oauth = OAuth({
      consumer: {
        key: config.appkey,
        secret: config.appsecret
      },
      last_ampersand: true,
      signature_method: 'HMAC-SHA1',
      hash_function: function (base_string, key) {
        return CryptoJS.HmacSHA1(base_string, key).toString(CryptoJS.enc.Base64);
      }
    });
  }

  extract (response) {
    let arr = response.split('&');
    let reduced = arr.reduce((acc, v) => {
      let [key, value] = v.split("=");
      acc[key] = value;
      return acc;
    }, {});
    return reduced;
  }

  async request (data, auth_func) {
    let ret = fetch(data.url, {
      method: data.method,
      timeout: 5000,
      headers: {
        'Authorization': auth_func.apply(this, [data]),
      }
    });
    return ret;
  }

  build_request_object (uri, method = 'POST') {
    let obj = {
      method: method,
      url: gearauthurl + uri,
    };

    let ret = {
      object: () => obj,
      data: (val) => {
        obj.data = val
        return ret;
      },
      request: (auth_func) => {
        return this.request(ret.object(), auth_func)
      }
    }
    return ret;
  }

  _getRequestToken = async () => {
    let req1_resp = await this.build_request_object('/api/rtoken')
    .data({oauth_callback: 'scope=&appid=' + "" + this.appid + '&mgrev=' + MGREV + '&verifier=' + verifier})
    .request((request_token) => {
      return this.oauth.toHeader(this.oauth.authorize(request_token)).Authorization
    });
    return req1_resp
  }

  _getAccessToken = async () => {
    let req2_resp = await this.build_request_object('/api/atoken')
    .data({oauth_verifier: verifier})
    .request((request_data) => {
      let _reqtok = {
        key: this._storage.get(Storage.KEY_OAUTH_REQUEST_TOKEN),
        secret: this._storage.get(Storage.KEY_OAUTH_REQUEST_TOKEN_SECRET)
      };
      let auth_header = this.oauth.toHeader(this.oauth.authorize(request_data, _reqtok)).Authorization
      return auth_header;
    })
    return req2_resp
  }

  _saveRequestToken = (object) => {
    log(`SET STATE= ${Storage.STATE.STATE_REQ_TOKEN}`)

    this._storage.set(Storage.KEY_STATE, Storage.STATE.STATE_REQ_TOKEN);
    this._storage.set(Storage.KEY_OAUTH_REQUEST_TOKEN, object.oauth_token);
    this._storage.set(Storage.KEY_OAUTH_REQUEST_TOKEN_SECRET, object.oauth_token_secret);
    this._storage.set(Storage.KEY_VERIFIER, object.verifier)
    log("DONE SAVE REQUEST_TOKEN")
  }

  _saveAccessToken = (object) => {
    log(`SET STATE= ${Storage.STATE.STATE_ACCESS_TOKEN}`)
    this._storage.set(Storage.KEY_STATE, Storage.STATE.STATE_ACCESS_TOKEN);
    this._storage.set(Storage.KEY_ACCESS_TOKEN, object.oauth_token);
    this._storage.set(Storage.KEY_ACCESS_TOKEN_SECRET, object.oauth_token_secret);
    this._storage.set(Storage.KEY_ENDPOINT, object.endpoint);
    this._storage.set(Storage.KEY_FLAG, object.flag);
    log("DONE save ACCESS TOKEN then commit...");
    // if done then serialize to storage
    this._storage.commit()
  }


  getToken = async () => {
    try {
      console.log(`NetpieAuth.js ${this}`)
      // @flow STEP1: GET REQUEST TOKEN
      let req1_resp = await this._getRequestToken();
      let {oauth_token, oauth_token_secret} = this.extract(await req1_resp.text());

      console.log(`getToken => ${oauth_token}`)
      this._saveRequestToken({oauth_token, oauth_token_secret, verifier})

      // @flow STEP2: GET ACCESS TOKEN
      let req2_resp = await this._getAccessToken();
      let token = this.extract(await req2_resp.text())
      this._saveAccessToken({
        oauth_token: token.oauth_token,
        oauth_token_secret: token.oauth_token_secret,
        endpoint: token.endpoint,
        flag: token.flag
      })

      return token
    }
    catch (ex) {
      console.log("ERROR", ex);
      return null
    }
  };
}

