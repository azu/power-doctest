// LICENSE : MIT
"use strict";
import assert from "power-assert"
import {wrapAssert} from "../src/ast-utils"
import {parse} from "esprima"
import astEqual from "ast-equal"
import {ast} from "esutils"
describe("ast-utils", function () {
    describe("#wrapNode", function () {
        it("should return ast", function () {
            var expressionNode = parse("1");
            var node = expressionNode.body[0].expression;
            var results = wrapAssert(node, node);
            var expected = "assert.equal(1, 1)";
            astEqual(results, expected);
        });
    });
});