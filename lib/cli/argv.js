var command = {
    exec: require('./exec'),
    output: require('./output')
};

var optimist = require('optimist');
var path = require("path");
// ---


optimist
    .usage("Usage: power-doctest [options] /path/to/file.js")
    .alias('h', 'help').describe('h', 'Display help and usage details.')
    .alias('o', 'output').describe('o', 'Output as file')
    .describe('debug', 'debug print')
    .boolean(['help', 'debug'])
    .wrap(80);


module.exports = function (str) {
    var argv = optimist.parse(str);
    // help
    var target = argv._[0];
    if (argv.help) {
        optimist.showHelp();
    } else if (argv.output) {
        command.output(target, argv.output);
    } else if (target) {
        command.exec(argv, path.resolve(process.cwd(), target));
    } else {
        optimist.showHelp();
    }
};