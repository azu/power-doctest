/**
 * Created by azu on 2014/03/02.
 * LICENSE : MIT
 */
"use strict";
var esprima = require("esprima");
var escodegen = require("escodegen");
var fs = require("fs");
/*
    Input : console.log(1);
    Ouput : 1

 */
function extractGenerator(node) {
    node.expression = {
        "type": "SequenceExpression",
        "expressions": node.expression["arguments"]
    };
    return node;
}


module.exports = extractGenerator;