import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";
import { runPowerDoctest } from "../src/power-doctest.js";
import * as assert from "assert";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("runPowerDoctest", function () {
    it("should test", async () => {
        return runPowerDoctest({
            content: `
const { name } = require("test-module");
console.log(name); // => "test-module"
`,
            contentType: "javascript",
            filePath: "./test.js",
            packageDir: path.join(__dirname, "fixture-pkg"),
            packageJSON: JSON.parse(
                await fs.promises.readFile(path.join(__dirname, "fixture-pkg", "package.json"), "utf-8"),
            ),
            disableRunning: false,
        }).then((results) => {
            assert.strictEqual(results.length, 1);
            assert.strictEqual(results[0].status, "fulfilled");
        });
    });
});
