var fs = require('fs');
var path = require("path");
var docPower = require("../power-doctest");
module.exports = function (filePath) {
    var fileData = fs.readFileSync(filePath, "utf-8");
    var result = docPower.runDocTest({
        fileData: fileData,
        filePath: filePath
    });
    if (!result) {
        process.exit(1);
    }
};

