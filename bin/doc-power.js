#!/usr/bin/env node

'use strict';

var cli = require("../lib/cli");
var argv = require("optimist")
    .usage("Usage: doc-power [options] /path/to/file.js")
    .argv;

cli.argv(argv);