// LICENSE : MIT
"use strict";
import { Syntax } from "estraverse";
import assert from "assert";
import toAST from "tagged-template-to-ast";

const commentCodeRegExp = /=>\s*?(.*?)$/i;

export function tryGetCodeFromComments(comments) {
    if (comments.length === 0) {
        return;
    }
    var comment = comments[0];
    if (comment.type === "Line" || comment.type === "Block") {
        var matchResult = comment.value.match(commentCodeRegExp);
    }
    if (matchResult && matchResult[1]) {
        return matchResult[1];
    }
}

function isConsole(node) {
    const expression = node.expression;
    if (!expression) {
        return false;
    }
    if (expression.type !== "CallExpression") {
        return false;
    }
    const callee = expression.callee;
    if (!callee) {
        return false;
    }
    if (!callee.object) {
        return false;
    }
    if (callee.object.name === "console") {
        return true;
    }
}

function extractionBody(ast) {
    return ast.body[0];
}

export const ERROR_COMMENT_PATTERN = /^([a-zA-Z]*?Error)/;
export const PROMISE_COMMENT_PATTERN = /^Promise:\s*(.*?)\s*$/;

export function wrapAssert(actualNode, expectedNode) {
    assert(typeof expectedNode !== "undefined");
    const type = expectedNode.type || extractionBody(expectedNode).type;
    if (type === Syntax.Identifier && ERROR_COMMENT_PATTERN.test(expectedNode.name)) {
        return toAST`assert.throws(function() {
                    ${actualNode}
               })`;
    } else if (type === "Promise") {
        const args = isConsole(actualNode) ? actualNode.expression.arguments[0] : actualNode;
        return toAST`Promise.resolve(${args}).then(v => {
            ${wrapAssert({ type: "Identifier", name: "v" }, expectedNode.value)}
            return v;
        });`;
    } else if (type === Syntax.Identifier && expectedNode.name === "NaN") {
        return toAST`assert(isNaN(${actualNode}));`;
    } else if (expectedNode.name === "undefined" || expectedNode.name === "null") {
        return toAST`assert.equal(${actualNode}, ${expectedNode})`;
    } else if (isConsole(actualNode)) {
        const args = actualNode.expression.arguments;
        const firstArg = args[0];
        return toAST`assert.deepEqual(${firstArg}, ${expectedNode})`;
    } else if (type === Syntax.Literal) {
        return toAST`assert.equal(${actualNode}, ${expectedNode})`;
    } else {
        return toAST`assert.deepEqual(${actualNode}, ${expectedNode})`;
    }
}
