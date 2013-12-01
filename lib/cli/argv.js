var command = {
    help: require('./help'),
    exec: require('./exec')
};

module.exports = function (argv) {
    // help
    var target = argv._[0];
    if (target === 'help') {
        command.help(argv);
    } else if (target) {
        command.exec(target);
    }
};