var OAuth = require('oauth-1.0a');

let CryptoJS = require("crypto-js");
let fetch = require("node-fetch")
let localStorage = require("node-localstorage").JSONStorage
// let _storage = new localStorage('./data');

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

export class NetpieOAuth {
  constructor (props) {
    console.log("props", props);
    this.appid = props.appid
    this.appkey = props.appkey
    this.appsecret = props.appsecret
    this.create(props)
    this._storage = new CMMC_Storage(this.appid)
  }

  getOAuthObject () {
    return this.oauth;
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


  OAuthGetRequestToken = async () => {
    this._storage.set(CMMC_Storage.KEY_STATE, STATE.STATE_REQ_TOKEN);
    let req1_resp = await this.build_request_object('/api/rtoken')
    .data({oauth_callback: 'scope=&appid=' + "" + this.appid + '&mgrev=' + MGREV + '&verifier=' + verifier})
    .request((request_token) => {
      return this.oauth.toHeader(this.oauth.authorize(request_token)).Authorization
    });

    let token = this.extract(await req1_resp.text());
    let {oauth_token, oauth_token_secret} = token;

    console.log("TOKEN>>>>>>", token)

    this._storage.set(CMMC_Storage.KEY_STATE, STATE.STATE_REQ_TOKEN);
    this._storage.set(CMMC_Storage.KEY_OAUTH_REQUEST_TOKEN, oauth_token);
    this._storage.set(CMMC_Storage.KEY_OAUTH_REQUEST_TOKEN_SECRET, oauth_token_secret);

    this._storage.commit()

    // console.log("TOKEN ====>", token);
    // token.verifier = verifier;
    //
    // console.log("token", token);

    let req2_resp = await this.build_request_object('/api/atoken')
    .data({oauth_verifier: verifier})
    .request((request_data) => {
      let _reqtok = {
        key: this._storage.get(CMMC_Storage.KEY_OAUTH_REQUEST_TOKEN),
        secret: this._storage.get(CMMC_Storage.KEY_OAUTH_REQUEST_TOKEN_SECRET)
      };
      console.log("req_acc_token", request_data)
      let auth_header = this.oauth.toHeader(this.oauth.authorize(request_data, _reqtok)).Authorization
      console.log("auth_header", auth_header)
      return auth_header;
    })

    let token2 = this.extract(await req2_resp.text())

    this._storage.set(CMMC_Storage.KEY_STATE, STATE.STATE_ACCESS_TOKEN);
    this._storage.set(CMMC_Storage.KEY_ACCESS_TOKEN, token2.oauth_token);
    this._storage.set(CMMC_Storage.KEY_ACCESS_TOKEN_SECRET, token.oauth_token_secret);
    this._storage.commit()
    //
    console.log("token2", token2);
    //
    // _storage.setItem("request_token", token);
    // _storage.setItem("access_token", token2);
    // _storage.setItem("oauth_request_token", token.oauth_token)
    // _storage.setItem("oauth_request_token_secret", token.oauth_token_secret)
    // _storage.setItem("oauth_access_token", token2.oauth_token)
    // _storage.setItem("oauth_access_token_secret", token2.oauth_token_secret)
    // _storage.setItem("endpoint", token2.endpoint)
    // _storage.setItem("flag", token2.flag)

    console.log(this._storage)
    return token2
  };
}

