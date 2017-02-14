"use strict";

var _mg = require("./mg");

var appid = "HelloNETPIE";
var appkey = "r0q49xoEnqf0ctw";
var appsecret = "KvWGcHYfNNzKN3dAYKXVwUhf1";

console.log("HELLO");
new _mg.NetpieOAuth({ appid: appid, appkey: appkey, appsecret: appsecret });
console.log(_mg.NetpieOAuth);