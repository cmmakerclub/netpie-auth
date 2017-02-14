var OAuth = require('oauth-1.0a');

let CryptoJS = require("crypto-js");
var fetch = require("node-fetch")

const VERSION = '1.0.9';
const GEARAPIADDRESS = 'ga.netpie.io';
const GEARAPIPORT = '8080';
const GEARAPISECUREPORT = '8081';
const GBPORT = '1883';
const GBSPORT = '8883';
const USETLS = false;
const securemode = false;

const MGREV = 'NJS1a';

let appid, appkey, appsecret = ""

const gearauthurl = 'http://' + GEARAPIADDRESS + ':' + GEARAPIPORT;
let verifier = MGREV;


export class NetpieOAuth {
  constructor (props) {
    console.log("props", props);
    console.log(CryptoJS)
    appid = props.appid
    appkey = props.appkey
    appsecret = props.appsecret
    this.create(props)
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
    var out = {};
    var arr = response.split('&');
    for (var i = 0; i < arr.length; i++) {
      var a = arr[i].split('=');
      out[a[0]] = a[1];
    }
    return out;
  }

  async request (data, auth_func) {
    let ret = fetch(data.url, {
      method: data.method,
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
      }
    }

    return ret;
  }

  OAuthGetRequestToken = async () => {
    let request_data = this.build_request_object('/api/rtoken')
    .data({oauth_callback: 'scope=&appid=' + appid + '&mgrev=' + MGREV + '&verifier=' + verifier});

    // request token
    let resp = await this.request(request_data.object(), (data) => {
      return this.oauth.toHeader(this.oauth.authorize(data)).Authorization
    })

    let {oauth_token, oauth_token_secret, oauth_callback_confirmed} = this.extract(await resp.text());
    //
    // console.log('oauth_token', oauth_token)
    // console.log('oauth_token_secret', oauth_token_secret)
    // console.log('oauth_token_callback_confirmed', oauth_callback_confirmed)

    let request_data2 = this.build_request_object('/api/atoken').data({oauth_verifier: verifier})

    // for verification
    let reqtok = {
      key: oauth_token,
      secret: oauth_token_secret
    };

    let resp2 = await this.request(request_data2.object(), (req_acc_token) => {
      return this.oauth.toHeader(this.oauth.authorize(req_acc_token, reqtok)).Authorization
    })

    return this.extract(await resp2.text())
  };
}

