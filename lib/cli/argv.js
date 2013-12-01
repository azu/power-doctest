var command = {
    help: require('./help'),
    exec: require('./exec'),
    output: require('./output')
};

var optimist = require('optimist');
// ---


optimist
    .usage("Usage: power-doctest [options] /path/to/file.js")
    .alias('h', 'help').describe('h', 'Display help and usage details.')
    .alias('o', 'output').describe('o', 'Output as file')
    .boolean(['help', 'version'])
    .wrap(80);


module.exports = function (str) {
    var argv = optimist.parse(str);
    // help
    var target = argv._[0];
    if (argv.help) {
        command.help();
    }
    else if (argv.output) {
        command.output(target, argv.output);
    }
    else if (target) {
        command.exec(target);
    }
};