import * as fs from "fs";
import * as path from "path";
import * as assert from "assert";
// transform function
import { run } from "../src";

const normalizeErrorName = (name: string) => {
    const match = name.match(/(.*Error)/);
    return match && match[1];
};
const fixturesDir = path.join(__dirname, "snapshots");
describe("Snapshot testing", () => {
    fs.readdirSync(fixturesDir)
        .map(caseName => {
            const normalizedTestName = caseName.replace(/-/g, " ");
            it(`Test ${normalizedTestName}`, async function() {
                const fixtureDir = path.join(fixturesDir, caseName);
                const actualFilePath = path.join(fixtureDir, "input.md");
                const actualContent = fs.readFileSync(actualFilePath, "utf-8");
                const actualOptionFilePath = path.join(fixtureDir, "options.json");
                const actualOptions = {
                    filePath: path.relative(fixtureDir, actualFilePath),
                    ...(
                        fs.existsSync(actualOptionFilePath)
                            ? JSON.parse(fs.readFileSync(actualOptionFilePath, "utf-8"))
                            // relative
                            : {}
                    )
                };
                const actual = await run(actualContent, actualOptions)
                    .then(() => {
                        return "PASS";
                    }).catch(error => {
                        return {
                            message: error.message,
                            errors: error.errors.map((error: any) => {
                                return {
                                    // do not add undefined value
                                    ...(error.meta ? {
                                        meta: error.meta
                                    } : {}),
                                    name: normalizeErrorName(error.name),
                                    ...(error.fileName && error.lineNumber >= 0 && error.columnNumber >= 0
                                            ? {

                                                fileName: error.fileName,
                                                lineNumber: error.lineNumber,
                                                columnNumber: error.columnNumber
                                            }
                                            : {}
                                    )
                                };
                            })
                        };
                    });
                const errorFilePath = path.join(fixtureDir, "error.txt");
                const okFilePath = path.join(fixtureDir, "pass.txt");
                if (actual === "PASS") {
                    assert.ok(!fs.existsSync(errorFilePath), "should not have error.txt");
                    fs.writeFileSync(okFilePath, "PASS");
                    return;
                }
                // Usage: update snapshots
                // UPDATE_SNAPSHOT=1 npm test
                if (!fs.existsSync(errorFilePath) || process.env.UPDATE_SNAPSHOT) {
                    fs.writeFileSync(errorFilePath, JSON.stringify(actual, null, 4));
                    this.skip(); // skip when updating snapshots
                    return;
                }
                // compare input and output
                const expectedContent = JSON.parse(fs.readFileSync(errorFilePath, "utf-8"));
                assert.deepStrictEqual(
                    actual,
                    expectedContent,
                    `
${fixtureDir}
${actual}
`
                );
                assert.ok(!fs.existsSync(okFilePath), "should not have pass.txt");
            });
        });
});
