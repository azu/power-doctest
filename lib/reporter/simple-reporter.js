/**
 * Created by azu on 2013/12/07.
 * LICENSE : MIT
 */

/**
 * reporter function
 * @param {Array} results
 * @param {Object} options
 * @returns {string}
 */
module.exports = function (results, options) {
    if (results.length === 0) {
        return "PASS";
    } else {
        var outputs = results.map(function (result) {
            var one = [];
            if (result.filePath) {
                one.push([result.filePath, result.loc.start.line, result.loc.start.column].join(":"));
            }
            // like TypeError:
            one.push(result.toString());
            var messagePerLine = result.message.split("\n");
            messagePerLine.splice(0, 1);
            one.push(messagePerLine.join("\n"));
            return one.join("\n");
        });
        return outputs.join("\n---\n")
    }
};