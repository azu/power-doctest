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
});
