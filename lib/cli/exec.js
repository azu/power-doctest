var fs = require('fs');
var path = require("path");
var docPower = require("../power-doctest");
module.exports = function (argv, filePath) {
    var fileData = fs.readFileSync(filePath, "utf-8");
    docPower.runDocTestAsPromise(fileData, {
        filePath: filePath,
        isDebug: argv.debug
    }).then(function (results) {
        docPower.printTestResult(null, results);
    }).catch(function (error) {
        docPower.printTestResult(error);
        process.exit(1);
    });
};

