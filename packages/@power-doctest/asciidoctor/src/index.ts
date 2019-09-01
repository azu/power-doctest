import { ParsedCode, ParsedResults, ParserArgs } from "@power-doctest/types";
import * as fs from "fs";
import * as path from "path";

const Asciidoctor = require("asciidoctor");
const asciidoctor = Asciidoctor();
type Attributes = {
    [index: string]: string;
}
const getState = (attributes: Attributes): "none" | "enabled" | "disabled" => {
    const state = attributes["doctest-state"];
    if (!state) {
        return "none";
    }
    if (/enable(d)?/.test(state)) {
        return "enabled";
    } else if (/disable(d)?/.test(state)) {
        return "disabled";
    }
    return "none";
};

const getMeta = (attributes: Attributes): {} | undefined => {
    const meta = attributes["doctest-meta"];
    if (!meta) {
        return;
    }
    try {
        return JSON.parse(meta);
    } catch (error) {
        // parse error
        throw new Error(`Can not parsed. doctest-meta={...} should be JSON object: ${error}`);
    }
};

const getOptions = (attributes: Attributes): {} | undefined => {
    const meta = attributes["doctest-options"];
    if (!meta) {
        return;
    }
    try {
        return JSON.parse(meta);
    } catch (error) {
        // parse error
        throw new Error(`Can not parsed. doctest-options={...} should be JSON object: ${error}`);
    }
};

// inlining include::
const inlineCode = (code: string, baseFilePath: string): string => {
    // include:: -> link:
    const pattern = /link:(.+)\[.*?]/;
    const dirName = path.dirname(baseFilePath);
    return code.replace(pattern, (all, filePath) => {
        const fileName = path.resolve(dirName, filePath);
        if (fs.existsSync(fileName)) {
            return fs.readFileSync(fileName, "utf-8");
        }
        return all;
    });
};

export function parse(args: ParserArgs): ParsedResults {
    const doc = asciidoctor.load(args.content);
    return doc.getBlocks()
        .filter((block: any) => {
            const attributes = block.getAttributes();
            return attributes.style === "source" && (attributes.language === "js" || attributes.language === "javascript");
        })
        .map((block: any) => {
            const lineNumber: number = block.document.getReader().lineno;
            const attributes: {} = block.getAttributes();
            const code: string = block.getSource();
            const lines: string[] = block.getSourceLines();
            const meta = getMeta(attributes);
            const doctestOptions = getOptions(attributes);
            const parsedCode: ParsedCode = {
                code: inlineCode(code, args.filePath),
                state: getState(attributes),
                location: {
                    start: {
                        line: lineNumber,
                        column: 0
                    },
                    end: {
                        line: lineNumber + lines.length,
                        column: 0
                    }
                },
                metadata: meta,
                doctestOptions: doctestOptions ? {
                    filePath: args.filePath,
                    ...doctestOptions
                } : {
                    filePath: args.filePath
                }
            };
            return parsedCode;
        });
}
