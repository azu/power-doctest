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
    } else if (type === Syntax.Literal) {
        return toAST`assert.equal(${actualNode}, ${expectedNode})`;
    } else {
        return toAST`assert.deepEqual(${actualNode}, ${expectedNode})`;
    }
}