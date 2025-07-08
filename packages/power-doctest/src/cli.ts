import * as fs from "fs";
import * as path from "path";
import meow from "meow";
import { runPowerDoctest, RunPowerDoctestOption } from "./power-doctest.js";

export async function run() {
    const cli = meow(
        `
    Usage:
      $ power-doctest /path/to/file.{js,md,adoc}

    Options:
      --packageDir      Current Working directory. Should put package.json in the directory.
      --disableRunning  Disable running test case that has not state.

    Examples:
      $ power-doctest ./README.md
      $ power-doctest ./README.adoc
      $ power-doctest ./src/main.js
    `,
        {
            importMeta: import.meta,
            flags: {
                packageDir: {
                    type: "string",
                },
                disableRunning: {
                    type: "boolean",
                    default: false,
                },
            },
        },
    );

    const disableRunning = cli.flags.disableRunning;
    const input = cli.input[0];
    if (!input) {
        cli.showHelp();
        throw new Error("No input file specified. Please provide a file path as an argument.");
    }
    const content = fs.readFileSync(input, "utf-8");
    const asciidoctExt = [".adoc", ".asc", ".asciidoctor"];
    const markdownFileExts = [".md", ".mkd", ".markdown"];
    const jsFileExts = [".js", ".mjs"];
    const contentType: RunPowerDoctestOption["contentType"] | null = (() => {
        const ext = path.extname(input);
        if (markdownFileExts.includes(ext)) {
            return "markdown";
        }
        if (jsFileExts.includes(ext)) {
            return "javascript";
        }
        if (asciidoctExt.includes(ext)) {
            return "asciidoctor";
        }
        return null;
    })();
    if (!contentType) {
        throw new Error("Not supported file type" + input);
    }
    const cwd = cli.flags.packageDir || process.cwd();
    const pkgFilePath = path.join(cwd, "package.json");
    const pkg = await (async () => {
        try {
            const packageJsonContent = await fs.promises.readFile(pkgFilePath, "utf8");
            return JSON.parse(packageJsonContent);
        } catch (error) {
            return;
        }
    })();
    const results = await runPowerDoctest({
        content,
        contentType,
        packageDir: cwd,
        packageJSON: pkg,
        filePath: input,
        disableRunning: disableRunning,
    });
    const passed = results.filter((result) => {
        return result.status === "fulfilled";
    });
    const rejected = results.filter((result) => {
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
${
    errors.length > 0
        ? `Errors:
${errors.join("\n")}`
        : ""
}`;
    if (rejected.length > 0) {
        throw new Error(message);
    }
    return message;
}
