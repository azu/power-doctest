var fs = require('fs');
var path = require('path');

module.exports = function (argv) {
    var basepath;
    var filepath;

    filepath = argv._.slice(0);
    filepath.push('txt');
    filepath = filepath.join('.');

    basepath = path.join(__dirname, '..', '..', 'doc', 'cli');
    filepath = path.join(basepath, filepath);

    return fs.createReadStream(filepath, 'utf8')
        .pipe(process.stdout)
        .on('close', function () {
            process.exit(1);
        });

};