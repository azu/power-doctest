#!/usr/bin/env node

'use strict';

var cli = require("../lib/cli");
var argv = require("optimist").argv;

cli.argv(argv);