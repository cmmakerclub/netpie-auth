var OAuth = require('oauth-1.0a');
var CryptoJS = require("crypto-js");
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

const appid = "HelloNETPIE";
const appkey = "r0q49xoEnqf0ctw";
const appsecret = "KvWGcHYfNNzKN3dAYKXVwUhf1";


export class NetpieOAuth {

  constructor (props) {
    console.log("props", props);
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

  OAuthGetRequestToken = async () => {
    let requesttoken = {};
    var gearauthurl;

    if (securemode) gearauthurl = 'https://' + GEARAPIADDRESS + ':' + GEARAPISECUREPORT;
    else gearauthurl = 'http://' + GEARAPIADDRESS + ':' + GEARAPIPORT;

    var gearalias = undefined;
    var verifier;
    if (gearalias) verifier = gearalias;
    else verifier = MGREV;

    // console.log("GearAuthURL", gearauthurl);

    let request_data = {
      url: gearauthurl + '/api/rtoken',
      method: 'POST',
      data: {
        oauth_callback: 'scope=&appid=' + appid + '&mgrev=' + MGREV + '&verifier=' + verifier,
      }
    };

    try {
      let req1 = await fetch(request_data.url, {
        method: request_data.method,
        headers: {
          'Authorization': this.oauth.toHeader(this.oauth.authorize(request_data)).Authorization,
        }
      });
      let body = await req1.text();
      let response_extracted = this.extract(body);
      requesttoken.token = response_extracted.oauth_token;
      requesttoken.secret = response_extracted.oauth_token_secret;
      requesttoken.verifier = verifier;

      let reqtok = {
        key: requesttoken.token,
        secret: requesttoken.secret
      };

      // access token
      let request_access_token = {
        url: gearauthurl + '/api/atoken',
        method: 'POST',
        data: {
          oauth_verifier: verifier,
        }
      };

      let req3 = await fetch(request_access_token.url, {
        method: request_access_token.method,
        headers: {
          'Authorization': this.oauth.toHeader(this.oauth.authorize(request_access_token, reqtok)).Authorization
        }
      });


      return req3.text();
    }
    catch (error) {
      console.log("error: ", error);
    }
  };
}

