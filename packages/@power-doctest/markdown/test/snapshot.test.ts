import * as fs from "fs";
import * as path from "path";
import * as assert from "assert";
// transform function
import { parse } from "../src";

const fixturesDir = path.join(__dirname, "snapshots");

const trimUndefinedProperty = <T>(o: T): T => {
    return JSON.parse(JSON.stringify(o));
};

describe("Snapshot testing", () => {
    fs.readdirSync(fixturesDir)
        .map(caseName => {
            const normalizedTestName = caseName.replace(/-/g, " ");
            it(`Test ${normalizedTestName}`, async function() {
                const fixtureDir = path.join(fixturesDir, caseName);
                const actualFilePath = path.join(fixtureDir, "input.md");
                const actualContent = fs.readFileSync(actualFilePath, "utf-8");
                const results = parse({
                    content: actualContent,
                    filePath: actualFilePath
                });
                const expectedFilePath = path.join(fixtureDir, "output.json");
                // Usage: update snapshots
                // UPDATE_SNAPSHOT=1 npm test
                if (!fs.existsSync(expectedFilePath) || process.env.UPDATE_SNAPSHOT) {
                    fs.writeFileSync(expectedFilePath, JSON.stringify(results, null, 4));
                    this.skip(); // skip when updating snapshots
                    return;
                }
                // compare input and output
                const expectedContent = JSON.parse(fs.readFileSync(expectedFilePath, "utf-8"));
                assert.deepStrictEqual(
                    trimUndefinedProperty(results),
                    expectedContent
                );
            });
        });
});
