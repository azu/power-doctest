import * as assert from "node:assert";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import * as vm from "node:vm";
import { toAssertFromSource } from "../src/comment-to-assert.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, "snapshots");
const trim = (s: unknown): string => {
	return typeof s === "string" ? s.trim() : "";
};

describe("Snapshot testing", () => {
	fs.readdirSync(fixturesDir).map((caseName) => {
		const normalizedTestName = caseName.replace(/-/g, " ");
		it(`Test ${normalizedTestName}`, async function () {
			const fixtureDir = path.join(fixturesDir, caseName);
			const actualFilePath = path.join(fixtureDir, "input.js");
			const actualContent = fs.readFileSync(actualFilePath, "utf-8");
			const optionFilePath = path.join(fixtureDir, "options.js");
			const options = fs.existsSync(optionFilePath) ? (await import(optionFilePath)).default : {};
			const actual = toAssertFromSource(actualContent, options);
			const expectedFilePath = path.join(fixtureDir, "output.js");
			// UPDATE_SNAPSHOT=1 npm test
			if (!fs.existsSync(expectedFilePath) || process.env.UPDATE_SNAPSHOT) {
				fs.writeFileSync(expectedFilePath, String(actual));
				this.skip();
				return;
			}
			const expected = fs.readFileSync(expectedFilePath, "utf-8");
			assert.deepStrictEqual(
				trim(actual),
				trim(expected),
				`
${fixtureDir}
${JSON.stringify(actual)}
`,
			);
			if (typeof actual !== "string") {
				throw new Error("actual is not string");
			}
			if (options.assertAfterCallbackName && options.assertBeforeCallbackName) {
				// finish after all called
				let actualCallCount = 0;
				const totalCountOfAssert = actual.split(options.assertBeforeCallbackName).length - 1;
				await new Promise<void>((resolve) => {
					vm.runInContext(
						actual,
						vm.createContext({
							assert,
							[options.assertBeforeCallbackName]: () => {
								// nope
							},
							[options.assertAfterCallbackName]: () => {
								actualCallCount++;
								if (actualCallCount === totalCountOfAssert) {
									resolve();
								}
							},
						}),
					);
				});
			} else {
				vm.runInContext(
					actual,
					vm.createContext({
						assert,
					}),
				);
			}
		});
	});
});
