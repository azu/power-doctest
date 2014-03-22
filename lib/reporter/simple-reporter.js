/**
 * Created by azu on 2013/12/07.
 * LICENSE : MIT
 */

/**
 * reporter function
 * @param {Error} error
 * @param {Object} options
 * @returns {string}
 */
module.exports = function (error, options) {
    if (!error) {
        return "PASS";
    } else {
        var one = [];
        if (error.filePath) {
            var filePath = error.filePath ? error.filePath : "anonymous";
            one.push([filePath, error.loc.start.line, error.loc.start.column].join(":"));
        }
        // like TypeError:
        one.push(error.name);
        one.push(error.message);
        return one.join("\n");
    }
};