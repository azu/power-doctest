import * as assert from "assert";
import { toAssertFromSource } from "../src/comment-to-assert.js";

describe("comment-to-assert", function () {
    describe("when invalid source", function () {
        it("should throw error", function () {
            assert.throws(() => {
                const code = "++++++";
                toAssertFromSource(code);
            });
        });
    });

    describe("error messages for comment parsing", function () {
        it("should throw error with line number information for VariableDeclaration", function () {
            assert.throws(
                () => {
                    const code = `
                    const a = 1;
                    const b = 2;
                    const c = 3;
                    // => "missing expression"
                `;
                    toAssertFromSource(code);
                },
                (error: Error) => {
                    assert.match(error.message, /Cannot add assertion to VariableDeclaration/);
                    assert.match(error.message, /at line 4/);
                    assert.match(error.message, /Comment assertions/);
                    assert.match(error.message, /can only be added to expressions, not declarations/);
                    return true;
                },
            );
        });

        it("should throw error for FunctionDeclaration with assertion comment", function () {
            assert.throws(
                () => {
                    const code = `
                    function testFunc() {
                        return 42;
                    } // => 42
                `;
                    toAssertFromSource(code);
                },
                (error: Error) => {
                    assert.match(error.message, /Cannot add assertion to FunctionDeclaration/);
                    assert.match(error.message, /at line 2/);
                    assert.match(error.message, /Comment assertions/);
                    assert.match(error.message, /can only be added to expressions, not declarations/);
                    return true;
                },
            );
        });

        it("should throw error for ClassDeclaration with assertion comment", function () {
            assert.throws(
                () => {
                    const code = `
                    class TestClass {
                        method() { return 'test'; }
                    } // => TestClass
                `;
                    toAssertFromSource(code);
                },
                (error: Error) => {
                    assert.match(error.message, /Cannot add assertion to ClassDeclaration/);
                    assert.match(error.message, /at line 2/);
                    assert.match(error.message, /Comment assertions/);
                    assert.match(error.message, /can only be added to expressions, not declarations/);
                    return true;
                },
            );
        });

        it("should throw error for ImportDeclaration with assertion comment", function () {
            assert.throws(
                () => {
                    const code = `
                    import fs from 'fs'; // => fs
                `;
                    toAssertFromSource(code);
                },
                (error: Error) => {
                    assert.match(error.message, /Cannot add assertion to ImportDeclaration/);
                    assert.match(error.message, /at line 2/);
                    assert.match(error.message, /Comment assertions/);
                    assert.match(error.message, /can only be added to expressions, not declarations/);
                    return true;
                },
            );
        });
    });
});
