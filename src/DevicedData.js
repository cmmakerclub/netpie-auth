"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DevicedData = undefined;

const fs = require("fs");

var DevicedData = exports.DevicedData = function() {
  function DevicedData() {
    var prefix = "netpie-auth-";
    var useDir = process.cwd();//__dirname;
    var postfix = ""; // /config
    var _this = this;

    this.Prefix = function() {
      return prefix;
    };

    this.UserDir = function() {
      return useDir;
    };

    this.getList = function() {

      var configFolder = useDir + postfix;

      if (fs.existsSync(configFolder) == false) {
        return [];
      }

      var files = fs.readdirSync(configFolder);
      var filesData = [];
      for (var i in files) {
        var fullFilePath = configFolder + "/" + files[i];

        if (fullFilePath.indexOf(prefix) == -1) {
          continue;
        }

        var fileData = fs.readFileSync(fullFilePath, "utf8");
        fileData = JSON.parse(fileData);
        filesData.push(fileData);
      }
      return filesData;
    };
  }

  return DevicedData;
}();

