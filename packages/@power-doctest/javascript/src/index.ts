import { ParsedResults, ParserArgs } from "@power-doctest/types";
import StructuredSource from "structured-source";

const getState = (code: string): "enabled" | "disabled" | "none" => {
    if (/\/\/\s*doctest-disable(d)?/.test(code)) {
        return "disabled";
    } else if (/\/\/\s*doctest-enable(d)?/.test(code)) {
        return "enabled";
    }
    return "none";
};

const getExpectedError = (code: string): string | undefined => {
    const pattern = /\/\/\s*doctest-error:\s*(\w+Error)/;
    const match = code.match(pattern);
    if (match && match[1]) {
        return match[1];
    }
    return;
};

export const parse = ({ content, filePath }: ParserArgs): ParsedResults => {
    const source = new StructuredSource(content);
    return [
        {
            code: content,
            location: {
                start: source.indexToPosition(0),
                end: source.indexToPosition(content.length - 1)
            },
            state: getState(content),
            expectedError: getExpectedError(content),
            doctestOptions: {
                filePath
            }
        }
    ];
};
