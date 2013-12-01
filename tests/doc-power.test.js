var assertAST = require("./lib/chai.assert.ast").equalAstToFn;
var docPower = require("../lib/doc-power");
var assert = require('chai').assert;
var escodegen = require("escodegen");
var vm = require('vm');
var path = require("path");
describe("docpower", function () {
    it("When expression + comment", function () {
        var code = "var a = 1;" +
            "a; // > 1";
        var resultAST = docPower.convertFromCodeToTree(code);
        assertAST(resultAST, function () {
            var a = 1;
            assert(a === 1);
        });
    });
    it("When CallExpression ", function () {
        var code = "var a = function(){return 1;};" +
            "a(); // > 1";
        var resultAST = docPower.convertFromCodeToTree(code);
        assertAST(resultAST, function () {
            var a = function () {
                return 1;
            };
            assert(a() === 1);
        });
    });
    describe("#regexpExecuted", function () {
        beforeEach(function () {
            docPower.regexpExecuted(/\s+==>\s(.*?)$/);
        });
        afterEach(function () {
            // reset
            docPower.regexpExecuted(/\s+>\s+(.*)$/);
        });
        it("accept regexp comment ", function () {
            var code = "var a = 1;" +
                "a; // ==> 1";
            var resultAST = docPower.convertFromCodeToTree(code);
            assertAST(resultAST, function () {
                var a = 1;
                assert(a === 1);
            });
        });
    });
    describe("#runDocTest", function () {
        context("when success test", function () {
            it("should not result message", function () {
                var code = "var a = 1;\n" +
                    "a; // > 1";
                var resultMessage = docPower.runDocTest(code);
                assert.isUndefined(resultMessage);
            });
        });
        context("when fail test", function () {
            it("should output message", function () {
                var code = "var a = 'test';\n" +
                    "a; // > 'not match'\n";
                var resultMessage = docPower.runDocTest(code);
                assert.isNotNull(resultMessage);
            });
        });
    });
});
