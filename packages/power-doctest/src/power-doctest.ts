import * as fs from "fs";
import * as path from "path";
import { test } from "@power-doctest/tester";
import { parse as parseJavaScript } from "@power-doctest/javascript";
import { parse as parseMarkdown } from "@power-doctest/markdown";
import { parse as parseAsciidoctor } from "@power-doctest/asciidoctor";
const allSettled = require("promise.allsettled");

export interface RunPowerDoctestOption {
    contentType: "javascript" | "markdown" | "asciidoctor";
    content: string;
    filePath: string;
    packageDir: string;
    packageJSON?: {};
    disableRunning: boolean;
}

export const createMockRequire = (packageDir: string, pkg?: any) => {
    if (!pkg) {
        return {};
    }
    const name = pkg["name"];
    const main = pkg["main"];
    if (!pkg["main"] || !name) {
        return {};
    }
    const mainFilepath = path.join(packageDir, main);
    if (!fs.existsSync(mainFilepath)) {
        throw new Error("Not found main file. " + mainFilepath);
    }
    if (!name) {
        throw new Error("Not defined pkg.name" + pkg);
    }
    return {
        [name]: require(mainFilepath)
    };
};

export async function runPowerDoctest(
    options: RunPowerDoctestOption
): Promise<{ status: "fulfilled" | "rejected"; code: string; value?: any; reason?: Error }[]> {
    const requireMock = createMockRequire(options.packageDir, options.packageJSON);
    const results = (() => {
        if (options.contentType === "javascript") {
            return parseJavaScript({
                content: options.content,
                filePath: options.filePath
            });
        }
        if (options.contentType === "markdown") {
            return parseMarkdown({
                content: options.content,
                filePath: options.filePath
            });
        }
        if (options.contentType === "asciidoctor") {
            return parseAsciidoctor({
                content: options.content,
                filePath: options.filePath
            });
        }
        return [];
    })();
    const promises = results.map(result => {
        return test(
            {
                ...result,
                doctestOptions: {
                    ...result.doctestOptions,
                    requireMock
                }
            },
            {
                disableRunning: options.disableRunning
            }
        );
    });
    const settledResults = await allSettled(promises);
    return settledResults.map((testResult: any, index: number) => {
        if (testResult.status === "fulfilled") {
            return {
                status: testResult.status,
                value: testResult.value,
                code: results[index].code
            };
        } else {
            return {
                status: testResult.status,
                reason: testResult.reason as Error,
                code: results[index].code
            };
        }
    });
}
