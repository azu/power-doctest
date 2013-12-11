var fs = require('fs');
var path = require("path");
var docPower = require("../power-doctest");
module.exports = function (argv, filePath) {
    var fileData = fs.readFileSync(filePath, "utf-8");
    var results = docPower.runDocTest({
        fileData: fileData,
        filePath: filePath
    }, {isDebug: argv.debug});
    docPower.printTestResult(results);
    if (results.length > 0) {
        process.exit(1);
    }
};

