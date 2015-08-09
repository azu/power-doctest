import astEqual from "ast-equal"
import {convertAST} from "../src/power-doctest"
import {parse} from "esprima"
function parseAndConvert(code) {
    var options = {
        range: true,
        comment: true,
        attachComment: true,
        tokens: true
    };
    var AST = parse(code, options);
    return convertAST(AST);
}

describe("power-doctest", function () {
    describe("#convertAST", function () {
        it("can transform expression// => comment", function () {
            var code = "var a = 1;\n" +
                "a;// => 1";
            var resultAST = parseAndConvert(code);
            astEqual(resultAST, `
                var assert = require("power-assert");
                var a = 1;
                assert.equal(a, 1);
            `);
        });
        it("is very simple case", function () {
            var code = "1; // => 1";
            var resultAST = parseAndConvert(code);
            astEqual(resultAST, `
            var assert = require("power-assert");
            assert.equal(1, 1);
            `);
        });
        it("can transform multiple doctest", function () {
            var code = "1; // => 1\n" +
                "2; // => 2\n";
            var resultAST = parseAndConvert(code);
            astEqual(resultAST, `
            var assert = require("power-assert");
            assert.equal(1, 1);
            assert.equal(2, 2);
            `);
        });
        it("can transform CallExpression", function () {
            var code = "var a = function(){return 1;};" +
                "a(); // => 1";
            var resultAST = parseAndConvert(code);
            astEqual(resultAST, `
                var assert = require("power-assert");
                var a = function () {
                    return 1;
                };
                assert.equal(a(), 1);
            `);
        });
        it("can transform + BinaryExpression", function () {
            var code = "var a = function(){return 1;};\n" +
                "a + 1; // => 2";
            var resultAST = parseAndConvert(code);
            astEqual(resultAST, `
                var assert = require("power-assert");
                var a = function () {
                    return 1;
                };
                assert.equal(a + 1 , 2);
            `);
        });
        it("can transform CallExpression", function () {
            var code = "function add(x,y){ return x + y}\n" +
                "add(1,2);// => 3";
            var resultAST = parseAndConvert(code);
            astEqual(resultAST, `
                var assert = require("power-assert");
                function add(x, y) {
                    return x + y
                }

                assert.equal(add(1, 2), 3);
            `);
        });
        it("should get expected data form BlockComment", function () {
            var code = "1; /* => 1 */";
            var resultAST = parseAndConvert(code);
            astEqual(resultAST, `
                var assert = require("power-assert");
                assert.equal(1, 1);
            `);
        });
    });
});
