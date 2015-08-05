// LICENSE : MIT
"use strict";
import assert from "power-assert"
import {wrapAssert,toAST} from "../src/ast-utils"
import {parse} from "esprima"
import {astEqual} from "./lib/ast-equal"
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
    describe("#toAST", function () {
        it("should return AST Node", function () {
            var nodeForInline = parse(1);
            var astNode = toAST`var a = ${nodeForInline}`;
            assert(typeof astNode === "object");
            assert(astNode.type === "Program");
        });
        it("should return ast that inlined parameter node", function () {
            var nodeForInline = parse('"string"');
            var astNode = toAST`var a = ${nodeForInline}`;
            var expected = `var a = "string"`;
            astEqual(astNode, expected);
        });
        it("support `${var} code`", function () {
            var nodeForInline = parse('"string"');
            var astNode = toAST`${nodeForInline}; var a;`;
            var expected = `"string";var a;`;
            astEqual(astNode, expected);
        });
        it("support function expression", function () {
            var nodeForInline = {
                "type": "FunctionExpression",
                "id": null,
                "params": [],
                "defaults": [],
                "body": {
                    "type": "BlockStatement",
                    "body": []
                },
                "generator": false,
                "expression": false
            };
            var astNode = toAST`var a = ${nodeForInline};`;
            var expected = `var a = function (){};`;
            astEqual(astNode, expected);
        });
    });
});