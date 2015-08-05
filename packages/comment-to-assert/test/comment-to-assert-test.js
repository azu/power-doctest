import assert from "power-assert"
import {
    commentToAssertFromCode,
    commentToAssertFromAST
} from "../src/comment-to-assert"
import {parse} from "esprima"
import {astEqual} from "./lib/ast-equal"

function parseToAST(code) {
    var parseOption = {
        loc: true,
        range: true,
        comment: true,
        attachComment: true
    };
    return parse(code, parseOption);
}
describe("comment-to-assert", function () {
    describe("#commentToAssertFromCode", function () {
        it("should return code", function () {
            var code = "var a = 1;";
            var result = commentToAssertFromCode(code);
            assert(typeof result === "string");
            astEqual(result, code);
        });
        it("should keep code mean", function () {
            var code = "var a = 1;// comment";
            var result = commentToAssertFromCode(code);
            assert(typeof result === "string");
            astEqual(result, code);
        });
    });
    describe("#commentToAssertFromAST", function () {
        it("should return AST", function () {
            var AST = parse("var a = 1;", {
                loc: true,
                range: true,
                comment: true
            });
            var result = commentToAssertFromAST(AST);
            assert(typeof result === "object");
            astEqual(result, AST);
        });
        it("should keep code mean", function () {
            var AST = parseToAST("var a = 1;// comment");
            var result = commentToAssertFromAST(AST);
            assert(typeof result === "object");
            astEqual(result, AST);
        });
    });
    describe("convert logic", function () {
        it("could handle primitive number", function () {
            var AST = parseToAST(`var a = 1;
            a;// => 1`);
            var result = commentToAssertFromAST(AST);
            var expected = `var a = 1;
            assert.equal(a, 1);`;
            astEqual(result, expected);
        });
        it("could handle string", function () {
            var AST = parseToAST(`var a = "str";
            a;// => "str"`);
            var result = commentToAssertFromAST(AST);
            var expected = `var a = "str";
            assert.equal(a, "str");`;
            astEqual(result, expected);
        });
        it("could handle object", function () {
            var AST = parseToAST(`var a = [1];
            a;// => [1]`);
            var result = commentToAssertFromAST(AST);
            var expected = `var a = [1];
            assert.deepEqual(a, [1]);`;
            astEqual(result, expected);
        });
        it("could handle Error", function () {
            var AST = parseToAST(`throw new Error("error");// => Error`);
            var result = commentToAssertFromAST(AST);
            var expected = `assert.throws(function() {
                throw new Error("error");
            }, Error);`;
            astEqual(result, expected);
        });
    });
});