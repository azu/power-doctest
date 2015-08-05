// LICENSE : MIT
"use strict";
import assert from "power-assert"
import {wrapNode} from "../src/ast-utils"
import {parse} from "esprima"
import {astEqual} from "./lib/ast-equal"
describe("ast-utils", function () {
    describe("#wrapNode", function () {
        it("should return ast", function () {
            var expressionNode = parse("1");
            var results = wrapNode(expressionNode);
            var expected = "assert(1)";
            astEqual(results, expected);
        });
    });
});