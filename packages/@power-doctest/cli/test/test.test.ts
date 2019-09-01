import * as path from "path";
import { testContent } from "../src/test";
import assert = require("assert");

describe("cli", function() {
    it("should test", () => {
        return testContent({
            content: `
const { name } = require("test-module");
console.log(name); // => "test-module"
`,
            contentType: "javascript",
            filePath: "./test.js",
            packageDir: path.join(__dirname, "fixture-pkg"),
            packageJSON: require(path.join(__dirname, "fixture-pkg", "package.json")),
            disableRunning: false
        }).then(results => {
            assert.strictEqual(results.length, 1);
            assert.strictEqual(results[0].status, "fulfilled");
        });
    });
});
