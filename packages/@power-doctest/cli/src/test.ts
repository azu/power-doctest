import * as fs from "fs";
import * as path from "path";
import { test } from "@power-doctest/tester";
import { parse as javascriptParse } from "@power-doctest/javascript";
import { parse as markdownParse } from "@power-doctest/markdown";

const allSettled = require("promise.allsettled");

export interface testOptions {
    contentType: "javascript" | "markdown";
    content: string;
    filePath: string;
    packageDir: string;
    packageJSON?: {};
    defaultRunning: boolean;
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

export async function testContent(options: testOptions): Promise<{ status: "fulfilled" | "rejected"; code: string; value?: any; reason?: Error }[]> {
    const requireMock = createMockRequire(options.packageDir, options.packageJSON);
    const results = (() => {
        if (options.contentType === "javascript") {
            return javascriptParse({
                content: options.content,
                filePath: options.filePath
            });
        }
        if (options.contentType === "markdown") {
            return markdownParse({
                content: options.content,
                filePath: options.filePath
            });
        }
        return [];
    })();
    const promises = results.map(result => {
        return test({
            ...result,
            doctestOptions: {
                ...result.doctestOptions,
                requireMock
            }
        });
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
