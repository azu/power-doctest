var fs = require('fs');
var path = require("path");
var docPower = require("../power-doctest");
module.exports = function (filePath) {
    var resolve = path.resolve(filePath);
    var fileData = fs.readFileSync(resolve, "utf-8");
    var result = docPower.runDocTest(fileData);

    if (result == null) {
        console.log("PASS");
    } else {
        console.log("FAIL", result);
    }
};
