'use strict';

const shell = require('shelljs');
const _ = require('lodash');

let result = shell.exec('git diff --cached --name-only --diff-filter=ACM', {silent: true});

if (!result.output) {
    shell.exit(0);
}

let files = _.compact(result.output.split('\n'));

files = files.filter(function (file) {
    return /src\/.*\.js$/.test(file);
});

if (!files.length) {
    shell.exit(0);
}

files.forEach(function (file) {
    var result = shell.exec('eslint ' + __dirname + '/' + file);

    if (result.code) {
        shell.exit(1);
    }
});