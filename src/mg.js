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

  async request (url, data) {
    let ret = fetch(url, {
      method: data.method,
      headers: {
        'Authorization': this.oauth.toHeader(this.oauth.authorize(data)).Authorization,
      }
    });

    return ret;
  }

  OAuthGetRequestToken = async () => {
    console.log("OAuthGetRequest");
    let requesttoken = {};
    let gearauthurl = 'http://' + GEARAPIADDRESS + ':' + GEARAPIPORT;
    let verifier = MGREV;

    console.log("GearAuthURL", gearauthurl);

    let request_data = {
      url: gearauthurl + '/api/rtoken',
      method: 'POST',
      data: {
        oauth_callback: 'scope=&appid=' + appid + '&mgrev=' + MGREV + '&verifier=' + verifier,
      }
    };

    let resp = await this.request(request_data.url, request_data)
    let text1 = await resp.text();
    console.log('text1', text1)

    // try {
    //   console.log("REQ 1")
    //   let req1 = await fetch(request_data.url, {
    //     method: request_data.method,
    //     headers: {
    //       'Authorization': this.oauth.toHeader(this.oauth.authorize(request_data)).Authorization,
    //     }
    //   });
    //
    //   console.log("WAIT REQ 1")
    //   let body = await req1.text();
    //   console.log("/WAIT REQ 1")
    //   console.log("BODY >>>>>", body)
    //   let response_extracted = this.extract(body);
    //   requesttoken.token = response_extracted.oauth_token;
    //   requesttoken.secret = response_extracted.oauth_token_secret;
    //   requesttoken.verifier = verifier;
    //
    //   let reqtok = {
    //     key: requesttoken.token,
    //     secret: requesttoken.secret
    //   };
    //
    //   // access token
    //   let request_access_token = {
    //     url: gearauthurl + '/api/atoken',
    //     method: 'POST',
    //     data: {
    //       oauth_verifier: verifier,
    //     }
    //   };
    //
    //   let req3 = await fetch(request_access_token.url, {
    //     method: request_access_token.method,
    //     headers: {
    //       'Authorization': this.oauth.toHeader(this.oauth.authorize(request_access_token, reqtok)).Authorization
    //     }
    //   });
    //
    //   return req3.text();
    // }
    // catch (error) {
    //   console.log("error: ", error);
    // }
  };
}

