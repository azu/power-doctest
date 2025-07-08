import assert from "node:assert";
import { createRequire } from "node:module";
import { parse } from "@babel/parser";
import { convertAST, type convertASTOptions, convertCode } from "../src/power-doctest.js";

const require = createRequire(import.meta.url);
const generate = require("@babel/generator").default;

function parseAndConvert(code: string, options?: convertASTOptions): any {
	const AST = parse(code, {
		sourceType: "module",
	});
	return convertAST(AST, {
		filePath: "test.js",
		...options,
	});
}

const astEqual = (a: any, b: any) => {
	const ast = parse(b, {
		sourceType: "module",
	});
	assert.strictEqual(generate(a).code, generate(ast as any).code);
};

describe("core", () => {
	describe("#convertCode", () => {
		it("should convert code to code", () => {
			var code = `function addPrefix(text, prefix = "デフォルト:") {
                return prefix + text;
            }`;
			var result = convertCode(code, {
				filePath: "test.js",
			});
			assert.strictEqual(
				result,
				`var assert = require("power-assert");
function addPrefix(text, prefix = "デフォルト:") {
  return prefix + text;
}`.trim(),
			);
		});
	});
	describe("#convertAST", () => {
		it("add assert module to header", () => {
			var code = "var a = 1;";
			var resultAST = parseAndConvert(code);
			astEqual(
				resultAST,
				`
            var assert = require("power-assert");
            var a = 1;
            `,
			);
		});
		it("add assert module to ", () => {
			var code = "var a = 1;";
			var resultAST = parseAndConvert(code);
			astEqual(
				resultAST,
				`
            var assert = require("power-assert");
            var a = 1;
            `,
			);
		});
		it("module type", () => {
			var code = `
            export default function hello() {
                var a = 1;
            }
                `;
			var resultAST = parseAndConvert(code);
			astEqual(
				resultAST,
				`
            var assert = require("power-assert");
            export default function hello() {
                var a = 1;
            }
                `,
			);
		});

		it("should support async function", () => {
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
		it("convert assert to power-assert format, it contain assert function", () => {
			var code = `
            var a = 1;
            a; // => 1`;
			var resultAST = parseAndConvert(code);
			const resultCode = generate(resultAST).code;
			assert.ok(resultCode.includes("assert.strictEqual"));
		});
		it("should support callback function", () => {
			var code = `
var a = 1;
console.log(a); // => 1
                `;
			const resultAST = parseAndConvert(code, {
				filePath: "test.js",
				assertBeforeCallbackName: "before",
				assertAfterCallbackName: "after",
			});
			const resultCode = generate(resultAST).code;
			assert.ok(resultCode.includes("before("));
			assert.ok(resultCode.includes("after("));
		});
	});
});
