import * as fs from "fs";
import * as path from "path";
import * as assert from "assert";
import { fileURLToPath } from "url";
import { run, test } from "../src/index.js";
import { parse } from "@power-doctest/javascript";

// Native Promise.allSettled is available in Node.js 12.9.0+
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const trimUndefinedProperty = <T>(o: T): T => {
    return JSON.parse(JSON.stringify(o));
};
const normalizeErrorName = (error: string) => {
    const match = error.match(/(.*Error)/);
    return match && match[1];
};
const fixturesDir = path.join(__dirname, "snapshots");
describe("Snapshot testing", () => {
    fs.readdirSync(fixturesDir).map((caseName) => {
        const normalizedTestName = caseName.replace(/-/g, " ");
        it(`Run ${normalizedTestName}`, async function () {
            const fixtureDir = path.join(fixturesDir, caseName);
            const actualFilePath = path.join(fixtureDir, "input.js");
            const actualContent = fs.readFileSync(actualFilePath, "utf-8");
            const actualOptionFilePath = path.join(fixtureDir, "options.json");
            const actualOptions = fs.existsSync(actualOptionFilePath)
                ? JSON.parse(fs.readFileSync(actualOptionFilePath, "utf-8"))
                : {};
            const actual =
                (await run(actualContent, actualOptions).catch((error) => {
                    return normalizeErrorName(error.name);
                })) || "NO ERROR";
            const expectedFilePath = path.join(fixtureDir, "error.txt");
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
`,
            );
        });
        it(`Test ${normalizedTestName}`, async function () {
            const fixtureDir = path.join(fixturesDir, caseName);
            const actualFilePath = path.join(fixtureDir, "input.js");
            const actualContent = fs.readFileSync(actualFilePath, "utf-8");
            const parsedResults = parse({
                content: actualContent,
                filePath: actualFilePath,
            });
            const promises = parsedResults.map((result) => {
                return test(result);
            });
            const actual = await Promise.allSettled(promises);
            const results = trimUndefinedProperty(
                actual.map((result: any) => {
                    if (result.status === "rejected") {
                        return {
                            status: result.status,
                            message: normalizeErrorName(result.reason.name),
                        };
                    }
                    return result;
                }),
            );
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
            assert.deepStrictEqual(results, expectedContent);
        });
    });
});
