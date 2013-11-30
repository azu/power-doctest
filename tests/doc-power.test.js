var assertAST = require("./lib/chai.assert.ast").equalAstToFn;
var docPower = require("../lib/doc-power");
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
    context("regexpExecuted", function () {
        beforeEach(function () {
            docPower.regexpExecuted(/\s+==>\s(.*?)$/)
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
});
