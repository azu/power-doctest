import * as fs from "fs";
import * as path from "path";
import meow from "meow";
import { testContent } from "./test";

export async function run() {
    const cli = meow(`
	Usage
	  $ power-doctest /path/to/file.{js,md}

	Options
	  --packageDir  Current Workind directory. Should put package.json in the directory.

	Examples
	  $ power-doctest ./README.md
	  $ power-doctest ./src/main.js
`, {
        flags: {
            packageDir: {
                type: "string"
            },
            defaultRunning: {
                type: "boolean"
            }
        }
    });
    const defaultRunning = cli.flags.defaultRunning;
    const input = cli.input[0];
    if (!input) {
        throw new Error("Should pass file");
    }
    const content = fs.readFileSync(input, "utf-8");
    const markdownFileExts = [".md", ".mkd", ".markdown"];
    const jsFileExts = [".js", ".mjs"];
    const contentType = (() => {
        const ext = path.extname(input);
        if (markdownFileExts.includes(ext)) {
            return "markdown";
        }
        if (jsFileExts.includes(ext)) {
            return "javascript";
        }
        return null;
    })();
    if (!contentType) {
        throw new Error("Not supported file type" + input);
    }
    const cwd = cli.flags.packageDir || process.cwd();
    const pkgFilePath = path.join(cwd, "package.json");
    const pkg = (() => {
        try {
            return require(pkgFilePath);
        } catch (error) {
            return;
        }
    })();
    const results = await testContent({
        content,
        contentType,
        packageDir: cwd,
        packageJSON: pkg,
        filePath: input,
        defaultRunning
    });
    const passed = results.filter(result => {
        return result.status === "fulfilled";
    });
    const rejected = results.filter(result => {
        return result.status === "rejected";
    });
    const errors = rejected.map((result) => {
        const error = (result as any).reason;
        const filePathLineColumn = `${error.fileName}:${error.lineNumber}:${error.columnNumber}`;
        return `Failed at ${filePathLineColumn}

${error.message}
----------
${result.code}
----------
`;
    });
    const message = `# Test Results
Pass: ${passed.length}
Fail: ${rejected.length}    
Total: ${passed.length + rejected.length}
${errors.length > 0 ? `Errors:
${errors.join("\n")}` : ""}`;
    if (rejected.length > 0) {
        throw new Error(message);
    }
    return message;
}
