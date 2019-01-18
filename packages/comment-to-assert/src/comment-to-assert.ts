// LICENSE : MIT
"use strict";
import { ERROR_COMMENT_PATTERN, PROMISE_COMMENT_PATTERN, tryGetCodeFromComments, wrapAssert } from "./ast-utils";
import { parse, transformFromAstSync } from "@babel/core";
import { identifier, isExpressionStatement } from "@babel/types";
import * as template from "@babel/template";
import traverse from "@babel/traverse";

/**
 * transform code to asserted code
 * if want to source map, use toAssertFromAST.
 * @param {string} code
 * @returns {string}
 */
export function toAssertFromSource(code: string) {
    const ast = parse(code, {
        // parse in strict mode and allow module declarations
        sourceType: "module",
        plugins: []
    });
    const output = toAssertFromAST(ast);
    const babelFileResult = transformFromAstSync(output, code, { comments: true });
    if (!babelFileResult) {
        throw new Error("can not generate from ast: " + JSON.stringify(output));
    }
    return babelFileResult.code;
}

function getExpressionNodeFromCommentValue(string: string): { type: string } & { [index: string]: any } {
    const message = string.trim();
    if (ERROR_COMMENT_PATTERN.test(message)) {
        const match = message.match(ERROR_COMMENT_PATTERN);
        if (!match) {
            throw new Error(`Can not Parse: // => Error: "message"`);
        }
        return identifier(match[1]);
    }
    if (PROMISE_COMMENT_PATTERN.test(message)) {
        const match = message.match(PROMISE_COMMENT_PATTERN);
        if (!match) {
            throw new Error("Can not Parse: // => Promise: value");
        }
        return {
            type: "Promise",
            value: getExpressionNodeFromCommentValue(match[1])
        };
    }
    try {
        return template.expression(string)();
    } catch (e) {
        console.error(`Can't parse comments // => expression`);
        throw e;
    }
}

/**
 * transform AST to asserted AST.
 */
export function toAssertFromAST(ast: any) {
    const replaceSet = new Set();
    traverse(ast, {
        exit(path) {
            if (!replaceSet.has(path.node) && path.node.trailingComments) {
                const commentExpression = tryGetCodeFromComments(path.node.trailingComments);
                if (commentExpression) {
                    const commentExpressionNode = getExpressionNodeFromCommentValue(commentExpression);
                    const actualNode = isExpressionStatement(path.node) ? path.node.expression : path.node;
                    const replacement = wrapAssert(actualNode, commentExpressionNode);
                    path.replaceWith(replacement);
                    replaceSet.add(path.node);
                }
            }
        }
    });
    return ast;
}
