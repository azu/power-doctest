import * as assert from "assert";
import { toAssertFromSource } from "../src/comment-to-assert";

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
        it("should throw error with line number information for standalone comment", function () {
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
                    console.log("Improved error message:", error.message);
                    assert.match(error.message, /Cannot add assertion to VariableDeclaration/);
                    assert.match(error.message, /at line 4/);
                    assert.match(error.message, /Comment assertions/);
                    assert.match(error.message, /can only be added to expressions, not declarations/);
                    return true;
                },
            );
        });
    });
});
