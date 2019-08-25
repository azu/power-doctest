import * as fs from "fs";
import * as path from "path";
import * as assert from "assert";
// transform function
import { convertCode } from "../src/power-doctest";

const fixturesDir = path.join(__dirname, "snapshots");
describe("Snapshot testing", () => {
    fs.readdirSync(fixturesDir)
        .map(caseName => {
            const normalizedTestName = caseName.replace(/-/g, " ");
            it(`Test ${normalizedTestName}`, async function() {
                const fixtureDir = path.join(fixturesDir, caseName);
                const actualFilePath = path.join(fixtureDir, "input.js");
                const actualContent = fs.readFileSync(actualFilePath, "utf-8");
                const actualOptionFilePath = path.join(fixtureDir, "options.json");
                const actualOptions = fs.existsSync(actualOptionFilePath)
                    ? JSON.parse(fs.readFileSync(actualOptionFilePath, "utf-8"))
                    : {};
                const actual = convertCode(actualContent, actualOptions);
                const expectedFilePath = path.join(fixtureDir, "output.js");
                // Usage: update snapshots
                // UPDATE_SNAPSHOT=1 npm test
                if (!fs.existsSync(expectedFilePath) || process.env.UPDATE_SNAPSHOT) {
                    fs.writeFileSync(expectedFilePath, actual);
                    this.skip(); // skip when updating snapshots
                    return;
                }
                // compare input and output
                const expectedContent = fs.readFileSync(expectedFilePath, "utf-8");
                assert.deepStrictEqual(
                    actual,
                    expectedContent,
                    `
${fixtureDir}
${actual}
`
                );
            });
        });
});
