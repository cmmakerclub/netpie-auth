var OAuth = require('oauth-1.0a');

let CryptoJS = require("crypto-js");
let fetch = require("node-fetch")
let localStorage = require("node-localstorage").JSONStorage
import * as Helper from './Util'

let Util = Helper.Util

const VERSION = '1.0.9';
const GEARAPIADDRESS = 'ga.netpie.io';
const GEARAPIPORT = '8080';
const GEARAPISECUREPORT = '8081';
const GBPORT = '1883';
const GBSPORT = '8883';
const USETLS = false;
const securemode = false;


const MGREV = 'NJS1a';

const gearauthurl = 'http://' + GEARAPIADDRESS + ':' + GEARAPIPORT;
let verifier = MGREV;

import {CMMC_Storage} from './storage'

const STATE = CMMC_Storage.STATE

export class NetpieAuth {
  constructor (props) {
    // console.log("props", props);
    this.appid = props.appid
    this.appkey = props.appkey
    this.appsecret = props.appsecret
    this.create(props)
    // initialize this._storage
    this._storage = new CMMC_Storage(this.appid)
  }


  getMqttAuth = async (callback) => {
    if (this._storage.get(CMMC_Storage.KEY_STATE) == STATE.STATE_ACCESS_TOKEN) {
      let appkey = this.appkey
      let appsecret = this.appsecret
      let appid = this.appid

      let access_token = this._storage.get(CMMC_Storage.KEY_ACCESS_TOKEN)
      let access_token_secret = this._storage.get(CMMC_Storage.KEY_ACCESS_TOKEN_SECRET)
      let endpoint = decodeURIComponent(this._storage.get(CMMC_Storage.KEY_ENDPOINT))
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
        appid, host, port, endpoint,
      }

      callback.call(null, ret);

    }
    else {
      try {
        await this.getToken();
        return this.getMqttAuth();
      }
      catch (err) {
        return null;
      }
    }
  }

  // getOAuthObject () {
  //   return this.oauth;
  // }

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
    this._storage.set(CMMC_Storage.KEY_STATE, STATE.STATE_REQ_TOKEN);
    let req1_resp = await this.build_request_object('/api/rtoken')
    .data({oauth_callback: 'scope=&appid=' + "" + this.appid + '&mgrev=' + MGREV + '&verifier=' + verifier})
    .request((request_token) => {
      return this.oauth.toHeader(this.oauth.authorize(request_token)).Authorization
    });
    return req1_resp
  }

  _getAccessToken = async () => {
    this._storage.set(CMMC_Storage.KEY_STATE, STATE.STATE_ACCESS_TOKEN);
    let req2_resp = await this.build_request_object('/api/atoken')
    .data({oauth_verifier: verifier})
    .request((request_data) => {
      let _reqtok = {
        key: this._storage.get(CMMC_Storage.KEY_OAUTH_REQUEST_TOKEN),
        secret: this._storage.get(CMMC_Storage.KEY_OAUTH_REQUEST_TOKEN_SECRET)
      };
      // console.log("req_acc_token", request_data)
      // console.log("auth_header", auth_header)
      let auth_header = this.oauth.toHeader(this.oauth.authorize(request_data, _reqtok)).Authorization
      return auth_header;
    })
    return req2_resp
  }

  _saveRequestToken = (object) => {
    this._storage.set(CMMC_Storage.KEY_STATE, STATE.STATE_REQ_TOKEN);
    this._storage.set(CMMC_Storage.KEY_OAUTH_REQUEST_TOKEN, object.oauth_token);
    this._storage.set(CMMC_Storage.KEY_OAUTH_REQUEST_TOKEN_SECRET, object.oauth_token_secret);
    this._storage.set(CMMC_Storage.KEY_VERIFIER, object.verifier)
  }

  _saveAccessToken = (object) => {
    this._storage.set(CMMC_Storage.KEY_STATE, STATE.STATE_ACCESS_TOKEN);
    this._storage.set(CMMC_Storage.KEY_ACCESS_TOKEN, object.oauth_token);
    this._storage.set(CMMC_Storage.KEY_ACCESS_TOKEN_SECRET, object.oauth_token_secret);
    this._storage.set(CMMC_Storage.KEY_ENDPOINT, object.endpoint);
    this._storage.set(CMMC_Storage.KEY_FLAG, object.flag);
    // if done then serialize to storage
    this._storage.commit()
  }


  getToken = async () => {
    try {
      // STEP1: GET REQUEST TOKEN
      let req1_resp = await this._getRequestToken();
      let {oauth_token, oauth_token_secret} = this.extract(await req1_resp.text());
      this._saveRequestToken({oauth_token, oauth_token_secret, verifier})

      // STEP2: GET ACCESS TOKEN
      let req2_resp = await this._getAccessToken();
      let token2 = this.extract(await req2_resp.text())
      this._saveAccessToken({
        oauth_token: token2.oauth_token,
        oauth_token_secret: token2.oauth_token_secret,
        endpoint: token2.endpoint,
        flag: token2.flag
      })

      return token2
    }
    catch (ex) {
      return false
    }
  };
}

