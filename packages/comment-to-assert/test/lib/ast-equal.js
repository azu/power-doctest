// LICENSE : MIT
"use strict";
import assert from "power-assert"
import {parse} from "esprima"
import {generate} from "escodegen"
export function astEqual(actual, expected, message) {
    var parseActual = typeof actual === "string" ? parse(actual) : actual;
    var parseExpected = typeof expected === "string" ? parse(expected) : expected;
    var generatedActual = generate(parseActual);
    var generatedExpected = generate(parseExpected);
    assert.strictEqual(generatedActual, generatedExpected, message);
}