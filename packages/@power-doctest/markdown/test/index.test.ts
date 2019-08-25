import fs from "fs";
import path from "path";
import { run } from "../src";
import assert = require("assert");

describe("run markdown", function() {
    it("is example", () => {
        const markdown = fs.readFileSync(path.join(__dirname, "fixtures/example.md"), "utf-8");
        return run(markdown).then(() => {
            // pass
        }).catch(aggregatedError => {
            assert.strictEqual(aggregatedError.message, "Throw 1 error in 2 code blocks");
            assert.strictEqual(aggregatedError.errors.length, 1);
            const [error] = aggregatedError.errors;
            assert.ok(typeof error.message, "string");
        });
    });
});
