var assertAST = require("./lib/chai.assert.ast").equalAstToFn;
var assert = require('chai').assert;
var escodegen = require("escodegen");
var path = require("path");
describe("power-doctest", function () {
    var docPower;
    beforeEach(function () {
        docPower = require("../lib/power-doctest");
    });
    afterEach(function () {
        delete(require.cache[path.resolve("../lib/power-doctest")]);
    });
    describe("mixin-assert", function () {
        it("should transform code to deepEqual", function () {
            var code = "var a = 1;" +
                "a; // => 1";
            var resultAST = docPower.convertFromCodeToTree(code, {
                astGenerator: require("../lib/ast-generator/mixin-assert")
            });
            assertAST(resultAST, function () {
                var a = 1;
                try {
                    var expected = 1;
                    if (typeof a === 'object' && typeof expected === 'object') {
                        assert.deepEqual(a, expected);
                    } else {
                        assert(a === 1);
                    }
                } catch (error) {
                    var newError = error;
                    newError.loc = {
                        start: {
                            column: 10,
                            line: 1
                        },
                        end: {
                            column: 12,
                            line: 1
                        }
                    };
                    throw newError;
                }
            });
        });
    });
});