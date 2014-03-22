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
                var filePath = result.filePath ? result.filePath : "anonymous";
                one.push([filePath, result.loc.start.line, result.loc.start.column].join(":"));
            }
            // like TypeError:
            one.push(result.name);
            one.push(result.message);
            return one.join("\n");
        });
        return outputs.join("\n---\n")
    }
};