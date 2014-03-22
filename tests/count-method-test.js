/**
 * Created by azu on 2014/03/22.
 * LICENSE : MIT
 */
"use strict";
var assert = require('chai').assert;
var parse = require("esprima").parse;
var countMethodCall = require("../lib/count-method").countMethodCall;
describe("countMethodCall", function () {
    it("counting `assert()`", function () {
        var code = "assert(1);assert(2);assert(3)";
        var results = countMethodCall(parse(code), "assert");
        assert.equal(results, 3);
    });
});