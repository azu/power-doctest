var fs = require('fs');
var path = require("path");
var docPower = require("../power-doctest");
module.exports = function (filePath) {
    var resolve = path.resolve(path.join(path.dirname(resolve), filePath));
    var fileData = fs.readFileSync(resolve, "utf-8");
    var result = docPower.runDocTest(fileData);
    if (result == null) {
        console.log("PASS");
    } else {
        var fileLineNumber = [resolve, result.loc.start.line,result.loc.start.column].join(":");
        console.log(fileLineNumber);
        var messagePerLine = result.message.split("\n");
        messagePerLine.splice(0,1);
        var message = messagePerLine.join("\n");
        console.log(message);
    }
};
