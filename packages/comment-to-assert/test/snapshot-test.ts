import * as fs from "fs";
import * as path from "path";
import * as assert from "assert";
import * as vm from "vm";
import { toAssertFromSource } from "../src/comment-to-assert";

const fixturesDir = path.join(__dirname, "snapshots");
describe("Snapshot testing", () => {
    fs.readdirSync(fixturesDir).map(caseName => {
        const normalizedTestName = caseName.replace(/-/g, " ");
        it(`Test ${normalizedTestName}`, function() {
            const fixtureDir = path.join(fixturesDir, caseName);
            const actualFilePath = path.join(fixtureDir, "input.js");
            const actualContent = fs.readFileSync(actualFilePath, "utf-8");
            const actual = toAssertFromSource(actualContent);
            const expectedFilePath = path.join(fixtureDir, "output.js");
            // UPDATE_SNAPSHOT=1 npm test
            if (!fs.existsSync(expectedFilePath) || process.env.UPDATE_SNAPSHOT) {
                fs.writeFileSync(expectedFilePath, actual);
                this.skip();
                return;
            }
            const expected = fs.readFileSync(expectedFilePath, "utf-8");
            assert.deepStrictEqual(
                actual,
                expected,
                `
${fixtureDir}
${JSON.stringify(actual)}
`
            );
            if (typeof actual === "string") {
                vm.runInContext(
                    actual,
                    vm.createContext({
                        assert
                    })
                );
            }
        });
    });
});
