module.exports = function (argv) {
    // help
    if (argv._[0] === 'help') {
        command.help(argv);
    }
};