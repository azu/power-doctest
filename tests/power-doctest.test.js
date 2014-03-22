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
    describe("#convertFromCodeToTree", function () {
        var options = {
            astGenerator: require("../lib/ast-generator/simple-assert")
        };
        it("can transform expression// => comment", function () {
            var code = "var a = 1;\n" +
                "a;// => 1";
            var resultAST = docPower.convertFromCodeToTree(code, options);
            assertAST(resultAST, function () {
                var a = 1;
                assert.ok(a === 1);
            });
        });
        it("is very simple case", function () {
            var code = "1; // => 1"
            var resultAST = docPower.convertFromCodeToTree(code, options);
            assertAST(resultAST, function () {
                assert.ok(1 === 1);
            });
        });
        it("can transform multiple doctest", function () {
            var code = "1; // => 1\n" +
                "2; // => 2\n"
            var resultAST = docPower.convertFromCodeToTree(code, options);
            assertAST(resultAST, function () {
                assert.ok(1 === 1);
                assert.ok(2 === 2);
            });
        });
        it("can transform CallExpression", function () {
            var code = "var a = function(){return 1;};" +
                "a(); // => 1";
            var resultAST = docPower.convertFromCodeToTree(code, options);
            assertAST(resultAST, function () {
                var a = function () {
                    return 1;
                };
                assert.ok(a() === 1);
            });
        });
        it("can transform + BinaryExpression", function () {
            var code = "var a = function(){return 1;};\n" +
                "a + 1; // => 2";
            var resultAST = docPower.convertFromCodeToTree(code, options);
            assertAST(resultAST, function () {
                var a = function () {
                    return 1;
                };
                assert.ok(a + 1 === 2);
            });
        });
        it("can transform CallExpression", function () {
            var code = "function add(x,y){ return x + y}\n" +
                "add(1,2);// => 3"
            var resultAST = docPower.convertFromCodeToTree(code, options);
            assertAST(resultAST, function () {
                function add(x, y) {
                    return x + y
                }

                assert.ok(add(1, 2) === 3);
            });
        });
        it("should get expected data form BlockComment", function () {
            var code = "1; /* => 1 */";
            var resultAST = docPower.convertFromCodeToTree(code, options);
            assertAST(resultAST, function () {
                assert.ok(1 === 1);
            });
        });
        context("When extract console.log option", function () {
            it("should extract value from console.log", function () {
                var options = {
                    astGenerator: require("../lib/ast-generator/simple-assert"),
                    extractConsole: true
                };
                var code = "console.log(1); /* => 1 */";
                var resultAST = docPower.convertFromCodeToTree(code, options);
                assertAST(resultAST, function () {
                    assert.ok(1 === 1);
                });
            });
        });
    });
    describe("option.astGenerator", function () {
        context("when set simple-deepEqual", function () {
            it("should transform code to deepEqual", function () {
                var code = "var a = 1;" +
                    "a; // => 1";
                var resultAST = docPower.convertFromCodeToTree(code, {
                    astGenerator: require("../lib/ast-generator/simple-deepEqual")
                });
                assertAST(resultAST, function () {
                    var a = 1;
                    assert.deepEqual(a, 1);
                });
            });
        });
    });
    describe("option.regexpExecuted", function () {
        var options = {
            regexpExecuted: /\s+===\s(.*?)$/,
            astGenerator: require("../lib/ast-generator/simple-assert")
        };
        it("accept regexp comment ", function () {
            var code = "var a = 1;" +
                "a; // === 1";
            var resultAST = docPower.convertFromCodeToTree(code, options);
            assertAST(resultAST, function () {
                var a = 1;
                assert.ok(a === 1);
            });
        });
    });
    describe("#runDocTest", function () {
        context("when no assert code", function () {
            it("should pass assert count = 0", function () {
                var code = "var a = 1;";
                return docPower.runDocTestAsPromise(code).then(function (result) {
                    var assertCount = 0;
                    assert.equal(result, assertCount);
                });
            });
        });
        context("when sync code", function () {
            it("should pass assert count", function () {
                var code = "var a = 1;\n" +
                    "a; // => 1";
                return docPower.runDocTestAsPromise(code).then(function (result) {
                    var assertCount = 1;
                    assert.equal(result, assertCount);
                });
            });
            it("could handle object", function () {
                var code = "var a = [1];\n" +
                    "a; // => [1]";
                return docPower.runDocTestAsPromise(code).then(function (result) {
                    assert.equal(result, 1);
                });
            });
        });
        context("when async code", function () {
            it("should pass assert count", function () {
                var code = "setTimeout(function(){" +
                    "var a = 1;\n" +
                    "a; // => 1\n" +
                    "},1);";
                return docPower.runDocTestAsPromise(code).then(function (result) {
                    var assertCount = 1;
                    assert.equal(result, assertCount);
                });
            });
        });
        context("when fail test", function () {
            function assertDocTestError(error) {
                assert.equal(error.name, "AssertionError");
            }

            it("should output message", function () {
                var code = "var a = 'test';\n" +
                    "a; // => 'not match'\n";
                return docPower.runDocTestAsPromise(code, {
                    filePath: __filename
                }).catch(function (error) {
                    assertDocTestError(error);
                });
            });
            context("Case assertion fail exception", function () {
                var code = "var a = 'test';\n" +
                    "a; // => 'not match'\n";
                it("should return doctest type errors", function () {
                    return  docPower.runDocTestAsPromise(code).then(function (value) {
                        console.log(value);
                    }).catch(function (error) {
                        assertDocTestError(error)
                    });
                });
            });
            context("Case exception test", function () {
                var code = "1; // => Error";
                it("should return doctest type errors", function () {
                    return docPower.runDocTestAsPromise(code).catch(function (error) {
                        assertDocTestError(error)
                    });
                });
            });
            context("Case other error(syntax error?)", function () {
                it("should throw exception", function () {
                    var code = "throw new Error('message');";
                    return docPower.runDocTestAsPromise(code).catch(function (error) {
                        assert.equal(error.message, "message");
                    });
                });
                it("should SyntaxError", function () {
                    var code = "1++1+++";
                    assert.throw(function () {
                        docPower.runDocTestAsPromise(code)
                    }, Error);
                });
            });
        });

    });
});
