// LICENSE : MIT
"use strict";
import assert from "power-assert"
import {parse} from "esprima"
import {generate} from "escodegen"
const parseOption = {
    loc: true,
    range: true,
    comment: true,
    attachComment: true
};
const generateOption = {
    comment: true
};
export function astEqual(actual, expected, message) {
    var parseActual = typeof actual === "string" ? parse(actual, parseOption) : actual;
    var parseExpected = typeof expected === "string" ? parse(expected, parseOption) : expected;
    var generatedActual = generate(parseActual, generateOption);
    var generatedExpected = generate(parseExpected, generateOption);
    assert.strictEqual(generatedActual, generatedExpected, message);
}