const assert = require("assert");
import { convertAST, convertCode } from "../src/power-doctest"
import { parse } from "@babel/parser"
import generate from "@babel/generator"

function parseAndConvert(code) {
    const AST = parse(code, {
        sourceType: "module"
    });
    return convertAST(AST);
}

const astEqual = (a, b) => {
    assert.strictEqual(generate(a).code, generate(parse(b, {
        sourceType: "module"
    })).code);
};

describe("power-doctest", function() {
    describe("#convertCode", function() {
        it("should convert code to code", function() {
            var code = `function addPrefix(text, prefix = "デフォルト:") {
                return prefix + text;
            }`;
            var result = convertCode(code);
            assert.equal(result, `var assert = require("power-assert");

function addPrefix(text, prefix = "デフォルト:") {
  return prefix + text;
}`.trim());
        });
    });
    describe("#convertAST", function() {
        it("add assert module to header", function() {
            var code = "var a = 1;";
            var resultAST = parseAndConvert(code);
            astEqual(resultAST, `
            var assert = require("power-assert");
            var a = 1;
            `);
        });
        it("add assert module to ", function() {
            var code = "var a = 1;";
            var resultAST = parseAndConvert(code);
            astEqual(resultAST, `
            var assert = require("power-assert");
            var a = 1;
            `);
        });
        it("module type", function() {
            var code = `
            export default function hello() {
                var a = 1;
            }
                `;
            var resultAST = parseAndConvert(code);
            astEqual(resultAST, `
            var assert = require("power-assert");
            export default function hello() {
                var a = 1;
            }
                `);
        });

        it("should support async function", function() {
            var code = `
            async function hello() {
                var a = 1;
                console.log(a); // => 1
            }
            hello();
                `;
            const resultAST = parseAndConvert(code);
            const resultCode = generate(resultAST).code;
            assert.ok(resultCode.includes("assert.strictEqual"));
        });
        it("convert assert to power-assert format, it contain assert function", function() {
            var code = `
            var a = 1;
            a; // => 1`;
            var resultAST = parseAndConvert(code);
            const resultCode = generate(resultAST).code;
            assert.ok(resultCode.includes("assert.strictEqual"));
        });
    });
});

