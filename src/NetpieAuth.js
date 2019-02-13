const OAuth = require('oauth-1.0a')
const fetch = require('node-fetch')
import { CMMC_Storage as Storage } from './CStorage'
import * as Helper from './Util'

let Util = Helper.Util

const VERSION = '1.0.9'
const GEARAPIADDRESS = 'ga.netpie.io'
const GEARAPIPORT = '8080'
const MGREV = 'NJS1a'

const gearauthurl = `http://${GEARAPIADDRESS}:${GEARAPIPORT}`
let verifier = MGREV

export class NetpieAuth {
  initilized = false

  constructor (props) {
    this.appid = props.appid
    this.appkey = props.appkey
    this.appsecret = props.appsecret
    this.prepare(props)
    this.initSync()
  }

  async initSync () {
    this._storage = new Storage(this.appid)
    let access_token_cached = this._storage.get(Storage.KEY_ACCESS_TOKEN)
    let access_token_secret_cached = this._storage.get(Storage.KEY_ACCESS_TOKEN_SECRET)
    let revoke_token_cached = this._storage.get(Storage.KEY_REVOKE_TOKEN)
    let appid_cached = this._storage.get(Storage.KEY_APP_ID)
    let appkey_cached = this._storage.get(Storage.KEY_APP_KEY)
    let appsecret_cached = this._storage.get(Storage.KEY_APP_SECRET)

    let should_revoke = ((this.appid !== appid_cached) || (this.appkey !== appkey_cached) ||
      (this.appsecret !== appsecret_cached) && appid_cached && appkey_cached && appsecret_cached)

    if (false && should_revoke) {
      Util.log(`[CACHED] => ${access_token_cached} - ${access_token_secret_cached}, ${revoke_token_cached}`)
      Util.log(`REVOKE URL = ${gearauthurl}/api/revoke/${access_token_cached}/${revoke_token_cached}`)
      try {
        let resp = await this.buildRequestObject(`/api/revoke/${access_token_cached}/${revoke_token_cached}`,
          'GET').request(() => {
        })
        let revoke_text = await resp.text()
        Util.log(`REVOKE RESPONSE = ${revoke_text}`)
        if (revoke_text === 'SUCCESS') {
          this._storage.clear()
        }
      }
      catch (ex) {
        Util.log('ERROR', ex)
      }
    }

    this.initilized = true
    return this
  }

  getMqttAuth = async (callback) => {
    if (this._storage.get(Storage.KEY_STATE) === Storage.STATE.STATE_ACCESS_TOKEN) {
      Util.debug(`STATE = ACCESS_TOKEN`)
      let [appkey, appsecret, appid] = [this.appkey, this.appsecret, this.appid]
      let [access_token, access_token_secret] = [this._storage.get(Storage.KEY_ACCESS_TOKEN),
        this._storage.get(Storage.KEY_ACCESS_TOKEN_SECRET)]
      let endpoint = decodeURIComponent(this._storage.get(Storage.KEY_ENDPOINT))
      let hkey = Util.compute_hkey(access_token_secret, appsecret)
      // let mqttusername = `${appkey}%${Math.floor(Date.now() / 1000)}`
      let mqttusername = `${appkey}`
      let mqttpassword = Util.compute_mqtt_password(access_token, mqttusername, hkey)
      let [input, protocol, host, port] = endpoint.match(/^([a-z]+):\/\/([^:\/]+):(\d+)/)
      let revoke_token = Util.compute_revoke_code(access_token, hkey)
      Util.debug(`revoke_token = ${revoke_token}`)
      let ret = {
        revoke_token, appid, host, port, endpoint,
        username: mqttusername,
        password: mqttpassword,
        client_id: access_token,
        prefix: `/${appid}/gearname/`
      }
      callback.apply(this, [ret])
    }
    else if (this._storage.get(Storage.KEY_STATE) === Storage.STATE.STATE_REQ_TOKEN) {
      Util.debug('req token')
      return this.getMqttAuth(callback)
    }
    else {
      // first request
      await this.getOAuthToken().then(() => {
        this.getMqttAuth(callback)
      }).catch((ex) => {
        Util.debug('Error => ', ex.message)
        throw ex
      })
    }
  }

  prepare (config) {
    this.oauth = OAuth({
      consumer: {
        key: config.appkey,
        secret: config.appsecret
      },
      last_ampersand: true,
      signature_method: 'HMAC-SHA1',
      hash_function: function (base_string, key) {
        return Util.hmac(base_string, key)
      }
    })
  }

  extract (response) {
    let arr = response.split('&')
    return arr.reduce((acc, v) => {
      let [key, value] = v.split('=')
      acc[key] = value
      return acc
    }, {})
  }

  async request (data, header_authorization_fn) {
    return fetch(data.url, {
      method: data.method,
      timeout: 5000,
      headers: {
        'Authorization': header_authorization_fn.apply(this, [data]),
      }
    })
  }

  buildRequestObject (uri, method = 'POST') {
    let obj = {
      method: method,
      url: gearauthurl + uri,
    }

    let ret = {
      object: () => obj,
      data: (val) => {
        obj.data = val
        return ret
      },
      request: (header_authorization_fn) => {
        return this.request(ret.object(), header_authorization_fn)
      }
    }
    return ret
  }

  _getRequestToken = async () => {
    return this.buildRequestObject('/api/rtoken')
      .data({oauth_callback: `scope=&appid=${this.appid}&mgrev=${MGREV}&verifier=${verifier}`})
      .request((request_token) => {
        return this.oauth.toHeader(this.oauth.authorize(request_token)).Authorization
      })
  }

  _getAccessToken = async () => {
    return this.buildRequestObject('/api/atoken')
      .data({oauth_verifier: verifier})
      .request((request_data) => {
        let _reqtok = {
          key: this._storage.get(Storage.KEY_OAUTH_REQUEST_TOKEN),
          secret: this._storage.get(Storage.KEY_OAUTH_REQUEST_TOKEN_SECRET)
        }
        let auth_header = this.oauth.toHeader(this.oauth.authorize(request_data, _reqtok)).Authorization
        return auth_header
      })
  }

  _saveRequestToken = (params) => {
    Util.debug(`SET STATE= ${Storage.STATE.STATE_REQ_TOKEN}`)
    let _data = new Map()

    _data.set(Storage.KEY_STATE, Storage.STATE.STATE_REQ_TOKEN)
    _data.set(Storage.KEY_OAUTH_REQUEST_TOKEN, params.oauth_token)
    _data.set(Storage.KEY_OAUTH_REQUEST_TOKEN_SECRET, params.oauth_token_secret)
    _data.set(Storage.KEY_VERIFIER, params.verifier)
    _data.set(Storage.KEY_APP_ID, this.appid)
    _data.set(Storage.KEY_APP_KEY, this.appkey)
    _data.set(Storage.KEY_APP_SECRET, this.appsecret)

    for (let [key, value] of _data.entries()) {
      Util.debug('SAVE REQ TOKEN: KEY ', key, '>>', value)
      this._storage.set(key, value)
    }
  }

  _saveAccessToken = (object) => {
    Util.debug(`SET STATE= ${Storage.STATE.STATE_ACCESS_TOKEN}`)
    let _data = new Map()
    _data.set(Storage.KEY_STATE, Storage.STATE.STATE_ACCESS_TOKEN)
    _data.set(Storage.KEY_ACCESS_TOKEN, object.oauth_token)
    _data.set(Storage.KEY_ACCESS_TOKEN_SECRET, object.oauth_token_secret)
    _data.set(Storage.KEY_REVOKE_TOKEN, object.revoke_token)
    _data.set(Storage.KEY_ENDPOINT, object.endpoint)
    _data.set(Storage.KEY_FLAG, object.flag)

    for (let [key, value] of _data.entries()) {
      this._storage.set(key, value)
    }
    this._storage.commit()
  }

  getOAuthToken = async () => {
    // @flow STEP1:
    // GET REQUEST TOKEN
    let req1_resp = await this._getRequestToken()
    if (req1_resp.ok) {
      let text = await req1_resp.text()
      let {oauth_token, oauth_token_secret} = this.extract(text)
      // @flow STEP1.2:
      // CACHE Request Token
      this._saveRequestToken({oauth_token, oauth_token_secret, verifier})

      // @flow STEP2:
      // GET ACCESS TOKEN
      let req2_resp = await this._getAccessToken()
      if (!req2_resp.ok) {
        throw new Error('Reached maximum (devices) quota.')
      }
      let access_token = this.extract(await req2_resp.text())

      // compute revoke token
      let hkey = Util.compute_hkey(access_token.oauth_token_secret, this.appsecret)
      let revoke_token = Util.compute_revoke_code(access_token.oauth_token, hkey)

      // @flow STEP2.2: CACHE Access Token
      this._saveAccessToken({
        oauth_token: access_token.oauth_token,
        oauth_token_secret: access_token.oauth_token_secret,
        endpoint: access_token.endpoint,
        flag: access_token.flag,
        revoke_token
      })
    }
    else {
      let err = {
        name: 'NetpieError',
        type: 'Invalid AppKey or AppSecret',
        message: `${req1_resp.status} ${req1_resp.statusText} (Invalid AppKey or AppSecret)`
      }
      throw new Error(err.message)
    }
  }
}

