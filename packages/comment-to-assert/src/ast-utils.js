// LICENSE : MIT
"use strict";
import {Syntax} from "estraverse"
import assert from "assert"
import toAST from "tagged-template-to-ast"
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
        return false
    }
    if (!callee.object) {
        return false
    }
    if (callee.object.name === "console") {
        return true;
    }
}
function extractionBody(ast) {
    return ast.body[0];
}
export function wrapAssert(actualNode, expectedNode) {
    assert(typeof expectedNode !== "undefined");
    var type = expectedNode.type || extractionBody(expectedNode).type;
    if (type === Syntax.Identifier && expectedNode.name === "Error") {
        return toAST`assert.throws(function() {
                    ${actualNode}
               }, ${expectedNode})`;
    } else if (type === Syntax.Identifier && expectedNode.name === "NaN") {
        return toAST`assert(isNaN(${actualNode}));`;
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