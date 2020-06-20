import { ParserArgs, ParsedResults } from "@power-doctest/types";
import { DocTestController } from "./DocTestController";

type UnistParentNode = import("unist").Parent;
// unist-util-parents
type UnistNode = import("unist").Node & {
    parent: UnistParentNode;
};

const remark = require("remark")();
const select = require("unist-util-select");
const attachParents = require("unist-util-parents");
const findAllBetween = require("unist-util-find-all-between");
const findBefore = require("unist-util-find-before");
const getComments = (parentNode: UnistParentNode, codeNode: UnistNode) => {
    const nonHtmlNode = findBefore(parentNode, codeNode, (node: UnistNode) => {
        return node.type !== "html";
    });
    const startNode = nonHtmlNode ? nonHtmlNode : parentNode.children[0];
    const htmlNodes = findAllBetween(parentNode, startNode, codeNode, "html");
    return htmlNodes.map((htmlNode: any) => {
        return htmlNode.value.replace(/^<!--/, "").replace(/-->$/, "");
    });
};

/**
 * Parse Markdown code and return ParseResult object.
 */
export const parse = ({ content, filePath }: ParserArgs): ParsedResults => {
    const markdownAST = attachParents(remark.parse(content));
    const codeBlocks = [].concat(
        select.selectAll(`code[lang="js"]`, markdownAST),
        select.selectAll(`code[lang="javascript"]`, markdownAST)
    );
    return codeBlocks.map((codeBlock: UnistNode) => {
        const codeValue: string = (codeBlock.value as string | undefined) || "";
        const comments = getComments(codeBlock.parent, codeBlock);
        const docTestController = new DocTestController(comments);
        const state = docTestController.state;
        const doctestOptions = docTestController.doctestOptions;
        const expectedError = docTestController.expectedErrorName;
        const metadata = docTestController.doctestMetadata;
        return {
            code: codeValue,
            location: codeBlock.position
                ? {
                      start: {
                          line: codeBlock.position.start.line,
                          column: codeBlock.position.start.column
                      },
                      end: {
                          line: codeBlock.position.end.line,
                          column: codeBlock.position.end.column
                      }
                  }
                : {
                      start: {
                          line: 1,
                          column: 0
                      },
                      end: {
                          line: 1,
                          column: 0
                      }
                  },
            state: state,
            expectedError: expectedError,
            metadata: metadata,
            doctestOptions: doctestOptions
                ? {
                      filePath: filePath,
                      ...doctestOptions
                  }
                : {
                      filePath
                  }
        };
    });
};
