import { run } from "../src/index";
import * as assert from "assert";

describe("run", () => {
    it("run example code", () => {
        return run(`
console.log(1); // => 1
console.log(1n); // => 1n
console.log("string"); // => "string"
console.log([1, 2, 3]); // => [1, 2, 3]
console.log({ key: "value" }); // => { key: "value" }
console.log(NaN); // => NaN
console.log(null); // => null
// Special Case
throw new Error("message"); // => Error: "message"
// Promise
Promise.resolve(1); // => Resolve: 1
Promise.reject(new Error("message")); // => Reject: "message"
`);
    });
    it("run throw code", () => {
        return run(`
throw new Error("message from code");
`).catch((error) => {
            assert.strictEqual(error.message, "message from code");
        });
    });
    it("run sync code with primitive", () => {
        return assert.doesNotReject(
            run(`
1 // => 1
`)
        );
    });
    it("run sync code with array", () => {
        return assert.doesNotReject(
            run(`
const array = [1, 2, 3];
console.log(array); // => [1, 2, 3]
`)
        );
    });
    it("run async code with Promise", () => {
        return assert.doesNotReject(
            run(`
Promise.resolve().then(() => {
    console.log(1); // => 1
    console.log(2); // => 2    
});
`)
        );
    });
    it("run async code with setTimeout", () => {
        return assert.doesNotReject(
            run(`
setTimeout(() => {
    console.log(1); // => 1
    console.log(2); // => 2    
}, 100);
`)
        );
    });
    it("does reject code with promise in async", () => {
        return assert.rejects(
            run(`
Promise.resolve().then(() => {
    console.log(1); // => 2
})
`),
            "should be rejected"
        );
    });
    it("does reject code with setTimeout in async", () => {
        return assert.rejects(
            run(`
setTimeout(() => {
    console.log(1); // => 2
}, 100);
`)
        );
    });

    it("does resolve when all asserted", () => {
        return assert.doesNotReject(
            run(`
1; // => 1
2; // => 2
3; // => 3
`)
        );
    });
    it("does resolve when anyone asserted", () => {
        return assert.doesNotReject(
            run(
                `
1; // => 1
// anyone is resolve then finish the code
2; // => "ng"
3; // => "ng"
`,
                {
                    runMode: "any",
                }
            )
        );
    });
    it("does timeout because all assertion never called", () => {
        return assert.rejects(
            run(
                `
if( true ) {
  1; // => 1
} else{
  2; // => 2
}
`,
                {
                    timeout: 100, // 100ms
                }
            )
        );
    });
});
