var esprima = require("esprima");
var escodegen = require("escodegen");
var assert = require('chai').assert;
var clone = require('clone');

function extractionBody(ast) {
    ast.body = ast.body[0].expression.argument.body.body;
    return ast;
}
exports.equalAstToFn = function (ast, fn2) {
    var targetAST = esprima.parse(escodegen.generate(ast));
    var expectedAST;
    try {
        var pickAST = esprima.parse("!" + fn2.toString());
        expectedAST = extractionBody(pickAST);
    } catch (e) {
        assert.fail("equalAstToFn Error", e)
    }
    assert.deepEqual(targetAST, expectedAST);
};