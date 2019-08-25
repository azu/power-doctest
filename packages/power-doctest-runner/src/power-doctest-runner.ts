import { NodeVM, VMScript } from "vm2";
import { convertCode } from "power-doctest";

const assert = require("power-assert");

export interface PowerDoctestRunnerOptions {
    // pseudo file path for code
    filePath?: string;
    // sandbox context for code
    // context defined global variables
    context?: {
        [index: string]: any
    }
    // If it is true, console.log output to console
    // If you want to mock console, please pass `console` to `context: { console: consoleMock }`
    //
    // Exception:
    // Always suppress console and assertion, because it is converted to assert function
    // ```
    // console.log(1); // => 1
    // ```
    console?: boolean;
    // Default: all
    // If runMode is all, all assertions are finished and resolve it
    // If runMode is any, anyone assertion is finished and resolve it
    // In Both, anyone is failed and reject it
    runMode?: "any" | "all";
    powerDoctestCallbackFunctionName?: string;
}

const CALLBACK_FUNCTION_NAME = "__power_doctest_callback__";

export function run(code: string, options: PowerDoctestRunnerOptions = {}) {
    const runMode = options.runMode || "all";
    const postCallbackName = options.powerDoctestCallbackFunctionName || CALLBACK_FUNCTION_NAME;
    const context = options.context || {};
    return new Promise((resolve, reject) => {
        // Test Runner like mocha listen unhandledRejection and uncaughtException
        // Disable these listener before running code
        const originalUnhandledRejection = process.listeners("unhandledRejection");
        const originalUncaughtException = process.listeners("uncaughtException");
        process.removeAllListeners("uncaughtException");
        process.removeAllListeners("unhandledRejection");
        const unhandledRejection = (reason: {}, _promise: Promise<any>): void => {
            restoreListener();
            reject(reason);
        };
        const uncaughtException = (error: Error): void => {
            restoreListener();
            reject(error);
        };
        const restoreListener = () => {
            process.off("uncaughtException", uncaughtException);
            process.off("unhandledRejection", unhandledRejection);
            // restore
            originalUncaughtException.forEach(listener => {
                process.addListener("uncaughtException", listener);
            });
            originalUnhandledRejection.forEach(listener => {
                process.addListener("unhandledRejection", listener);
            });
        };
        process.on("uncaughtException", uncaughtException);
        process.on("unhandledRejection", unhandledRejection as any);
        const poweredCode = convertCode(code, {
            assertAfterCallbackName: postCallbackName
        });
        // total count of assert
        const totalAssertionCount = poweredCode.split(CALLBACK_FUNCTION_NAME).length - 1;
        // current count of assert
        let countOfExecutedAssertion = 0;
        const vm = new NodeVM({
            console: options.console ? "inherit" : "off",
            sandbox: {
                [postCallbackName]: (_id: string) => {
                    countOfExecutedAssertion++;
                    if (runMode === "all" && countOfExecutedAssertion === totalAssertionCount) {
                        // when all finish
                        restoreListener();
                        resolve();
                    } else if (runMode === "any") {
                        // when anyone finish
                        restoreListener();
                        resolve();
                    }
                },
                // User defined context
                ...context
            },
            require: {
                external: true,
                mock: {
                    "power-assert": assert
                }
            }
        });
        const script = new VMScript(poweredCode, options.filePath);
        vm.run(script);
    });
}
