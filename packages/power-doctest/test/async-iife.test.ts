import * as assert from "node:assert";
import { runPowerDoctest } from "../src/power-doctest.js";

describe("Async IIFE (Immediately Invoked Function Expression) patterns", () => {
	it("should handle basic async IIFE pattern", async () => {
		const content = `
(async function() {
    const result = await Promise.resolve("basic async processing");
    console.log(result); // => "basic async processing"
})();
`;
		const results = await runPowerDoctest({
			content,
			contentType: "javascript",
			filePath: "./test-async-iife.js",
			packageDir: process.cwd(),
			packageJSON: undefined,
			disableRunning: false,
		});

		assert.strictEqual(results.length, 1);
		assert.strictEqual(results[0].status, "fulfilled");
	});

	it("should handle async IIFE with multiple awaits", async () => {
		const content = `
(async function() {
    const first = await Promise.resolve("first result");
    const second = await Promise.resolve("second result");
    
    console.log(first); // => "first result"
    console.log(second); // => "second result"
    
    const combined = \`\${first} + \${second}\`;
    console.log(combined); // => "first result + second result"
})();
`;
		const results = await runPowerDoctest({
			content,
			contentType: "javascript",
			filePath: "./test-multiple-await.js",
			packageDir: process.cwd(),
			packageJSON: undefined,
			disableRunning: false,
		});

		assert.strictEqual(results.length, 1);
		assert.strictEqual(results[0].status, "fulfilled");
	});

	it("should handle async IIFE with error handling", async () => {
		const content = `
(async function() {
    try {
        const result = await Promise.resolve("successful result");
        console.log(result); // => "successful result"
    } catch (error) {
        console.log("Error occurred:", error.message);
    }
})();
`;
		const results = await runPowerDoctest({
			content,
			contentType: "javascript",
			filePath: "./test-error-handling.js",
			packageDir: process.cwd(),
			packageJSON: undefined,
			disableRunning: false,
		});

		assert.strictEqual(results.length, 1);
		assert.strictEqual(results[0].status, "fulfilled");
	});

	it("should handle async IIFE with time-consuming operations", async () => {
		const content = `
(async function() {
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    await delay(50); // wait 50ms
    const result = "time-consuming process completed";
    console.log(result); // => "time-consuming process completed"
})();
`;
		const results = await runPowerDoctest({
			content,
			contentType: "javascript",
			filePath: "./test-delay.js",
			packageDir: process.cwd(),
			packageJSON: undefined,
			disableRunning: false,
		});

		assert.strictEqual(results.length, 1);
		assert.strictEqual(results[0].status, "fulfilled");
	});

	it("should handle async IIFE with complex async operations", async () => {
		const content = `
(async function() {
    const fetchData = async (id) => {
        // simulate async data fetching
        await new Promise(resolve => setTimeout(resolve, 10));
        return { id, data: \`data\${id}\` };
    };
    
    const data1 = await fetchData(1);
    const data2 = await fetchData(2);
    
    console.log(data1); // => { id: 1, data: "data1" }
    console.log(data2); // => { id: 2, data: "data2" }
    
    const combined = [data1, data2];
    console.log(combined.length); // => 2
})();
`;
		const results = await runPowerDoctest({
			content,
			contentType: "javascript",
			filePath: "./test-complex-async.js",
			packageDir: process.cwd(),
			packageJSON: undefined,
			disableRunning: false,
		});

		assert.strictEqual(results.length, 1);
		assert.strictEqual(results[0].status, "fulfilled");
	});

	it("should properly detect error cases", async () => {
		const content = `
(async function() {
    const result = await Promise.resolve("actual value");
    console.log(result); // => "wrong expected value"
})();
`;
		const results = await runPowerDoctest({
			content,
			contentType: "javascript",
			filePath: "./test-error-case.js",
			packageDir: process.cwd(),
			packageJSON: undefined,
			disableRunning: false,
		});

		assert.strictEqual(results.length, 1);
		assert.strictEqual(results[0].status, "rejected");

		if (results[0].status === "rejected") {
			const error = results[0].reason;
			assert.ok(error && error.message.includes("strictEqual"));
		}
	});

	it("should handle nested async IIFE", async () => {
		const content = `
(async function() {
    const outerResult = await Promise.resolve("outer result");
    console.log(outerResult); // => "outer result"
    
    const innerFunction = async () => {
        const innerResult = await Promise.resolve("inner result");
        return innerResult;
    };
    
    const inner = await innerFunction();
    console.log(inner); // => "inner result"
})();
`;
		const results = await runPowerDoctest({
			content,
			contentType: "javascript",
			filePath: "./test-nested.js",
			packageDir: process.cwd(),
			packageJSON: undefined,
			disableRunning: false,
		});

		assert.strictEqual(results.length, 1);
		assert.strictEqual(results[0].status, "fulfilled");
	});

	it("should handle multiple independent async IIFEs", async () => {
		const content = `
(async function() {
    const result1 = await Promise.resolve("first function");
    console.log(result1); // => "first function"
})();

(async function() {
    const result2 = await Promise.resolve("second function");
    console.log(result2); // => "second function"
})();
`;
		const results = await runPowerDoctest({
			content,
			contentType: "javascript",
			filePath: "./test-multiple-iife.js",
			packageDir: process.cwd(),
			packageJSON: undefined,
			disableRunning: false,
		});

		// Multiple IIFEs may return multiple results
		assert.ok(results.length >= 1);
		results.forEach((result) => {
			assert.strictEqual(result.status, "fulfilled");
		});
	});
});
