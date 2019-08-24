import { NodeVM, VMScript } from "vm2";
import makeConsoleMock from "consolemock";
import { convertCode } from "power-doctest";

const assert = require("power-assert");

export interface PowerDoctestRunnerOptions {
    filePath?: string;
    debug?: boolean;
    // Default: all
    runMode?: "any" | "all";
    powerDoctestCallbackFunctionName?: string;
}

const CALLBACK_FUNCTION_NAME = "__power_doctest_callback__";

export function run(code: string, options: PowerDoctestRunnerOptions = {}) {
    const runMode = options.runMode || "all";
    const powerDoctestCallbackFunctionName = options.powerDoctestCallbackFunctionName || CALLBACK_FUNCTION_NAME;
    return new Promise((resolve, reject) => {
        // Test Runner like mocha listen unhandledRejection and uncaughtException
        // Disable these listener before running code
        const originalUnhandledRejection = process.listeners("unhandledRejection");
        const originalUncaughtException = process.listeners("uncaughtException");
        process.removeAllListeners("uncaughtException");
        process.removeAllListeners("unhandledRejection");
        const unhandledRejection = (reason: {}, _promise: Promise<any>): void => {
            restoreListner();
            reject(reason);
        };
        const uncaughtException = (error: Error): void => {
            restoreListner();
            reject(error);
        };
        const restoreListner = () => {
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
        // current count
        let countOfExecutedAssertion = 0;
        const vm = new NodeVM({
            sandbox: {
                [powerDoctestCallbackFunctionName]: (_id: string) => {
                    countOfExecutedAssertion++;
                    if (runMode === "all" && countOfExecutedAssertion === totalAssertionCount) {
                        // when all finish
                        restoreListner();
                        resolve();
                    } else if (runMode === "any") {
                        // when anyone finish
                        restoreListner();
                        resolve();
                    }
                }
            },
            require: {
                external: true,
                mock: {
                    "power-assert": assert,
                    console: options.debug ? console : makeConsoleMock(),
                }
            }
        });
        const poweredCode = convertCode(code, {
            assertAfterCallbackName: powerDoctestCallbackFunctionName
        });
        const totalAssertionCount = poweredCode.split(CALLBACK_FUNCTION_NAME).length - 1;
        const script = new VMScript(poweredCode, options.filePath);
        vm.run(script);
    })
}
