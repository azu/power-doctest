// LICENSE : MIT
"use strict";
import * as assert from "assert";
import { CallExpression, Comment, isCallExpression, isIdentifier, isLiteral, isNullLiteral } from "@babel/types";
import template from "@babel/template";

const commentCodeRegExp = /=>\s*?(.*?)$/i;

export function tryGetCodeFromComments(comments: ReadonlyArray<Comment>) {
    if (comments.length === 0) {
        return;
    }
    var comment = comments[0];
    if (comment.type === "CommentBlock" || comment.type === "CommentLine") {
        var matchResult = comment.value.match(commentCodeRegExp);
        if (matchResult && matchResult[1]) {
            return matchResult[1];
        }
    }
    return;
}

function isConsole(node: any): node is CallExpression & { expression: any } {
    return isCallExpression(node) && (node.callee as any).object && (node.callee as any).object.name === "console";
}

function extractionBody(ast: any) {
    return ast.body[0];
}

export const ERROR_COMMENT_PATTERN = /^([a-zA-Z]*?Error)/;
export const PROMISE_COMMENT_PATTERN = /^Promise:\s*(.*?)\s*$/;

export interface wrapAssertOptions {
    asyncCallbackName?: string;
}

export function wrapAssert(actualNode: any, expectedNode: any, options: wrapAssertOptions = {}): any {
    assert.notEqual(typeof expectedNode, "undefined");
    const type = expectedNode.type || extractionBody(expectedNode).type;
    const ACTUAL_NODE = actualNode;
    const EXPECTED_NODE = expectedNode;
    if (isConsole(actualNode)) {
        const args = actualNode.arguments;
        const firstArgument = args[0];
        return wrapAssert(firstArgument, expectedNode);
    } else if (isIdentifier(expectedNode) && ERROR_COMMENT_PATTERN.test(expectedNode.name)) {
        return template`assert.throws(function() {
                    ACTUAL_NODE
               })`({
            ACTUAL_NODE
        });
    } else if (type === "Promise") {
        const ARGS = isConsole(actualNode) ? actualNode.arguments[0] : actualNode;
        // support callback
        const asyncCallbackName = options.asyncCallbackName;
        if (asyncCallbackName) {
            return template`Promise.resolve(ARGS).then(v => {
            ${wrapAssert({ type: "Identifier", name: "v" }, expectedNode.node)}
            ${asyncCallbackName}(null, v);
            return v;
        }).catch(error => {
            ${asyncCallbackName}(error);
        })`({
                ARGS
            });
        } else {
            return template`Promise.resolve(ARGS).then(v => {
            ${wrapAssert({ type: "Identifier", name: "v" }, expectedNode.node)}
            return v;
        });`({
                ARGS
            });
        }
    } else if (isIdentifier(expectedNode) && expectedNode.name === "NaN") {
        return template`assert.ok(isNaN(ACTUAL_NODE));`({
            ACTUAL_NODE
        });
    } else if (isNullLiteral(expectedNode)) {
        return template`assert.strictEqual(ACTUAL_NODE, null)`({
            ACTUAL_NODE
        });
    } else if (isIdentifier(expectedNode) && expectedNode.name === "undefined") {
        return template`assert.strictEqual(ACTUAL_NODE, undefined)`({
            ACTUAL_NODE
        });
    } else if (isLiteral(expectedNode)) {
        return template`assert.strictEqual(ACTUAL_NODE, EXPECTED_NODE)`({
            ACTUAL_NODE,
            EXPECTED_NODE
        });
    } else {
        return template`assert.deepStrictEqual(ACTUAL_NODE, EXPECTED_NODE)`({
            ACTUAL_NODE,
            EXPECTED_NODE
        });
    }
    throw new Error("Unknown pattern: " + actualNode);
}
