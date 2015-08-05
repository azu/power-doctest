// LICENSE : MIT
"use strict";
import {parse} from "esprima"
import {generate} from "escodegen"
import {Syntax} from "estraverse"

const commentCodeRegExp = /=>\s*?(.*?)$/i;
export function tryGetCodeFromComments(comments) {
    if (comments.length === 0) {
        return;
    }
    var comment = comments[0];
    if (comment.type === "Line") {
        var matchResult = comment.value.match(commentCodeRegExp);
    }
    if (matchResult && matchResult[1]) {
        return matchResult[1];
    }
}

function astToCode(expression) {
    return generate({
        "type": "Program",
        "body": [
            expression
        ]
    }, {
        format: {
            compact: false,
            parentheses: true,
            semicolons: false,
            safeConcatenation: false
        }
    });
}
function extractionBody(ast) {
    return ast.body[0];
}
export function toAST(strings, ...astNodes) {
    var concatCode = strings.map((string, index) => {
        var code = (astNodes[index] ? astToCode(astNodes[index]) : "");
        return string + code;
    }).join("");
    console.log(concatCode);
    return parse(concatCode);
}

export function wrapAssert(actualNode, expectedNode) {
    var type = expectedNode.type || extractionBody(expectedNode).type;
    if (type === Syntax.Identifier && expectedNode.name === "Error") {
        return toAST`
assert.throws(function() {
    ${actualNode}
}, ${expectedNode})`;
    } else if (type === Syntax.Literal) {
        return toAST`assert.equal(${actualNode}, ${expectedNode})`;
    } else {
        return toAST`assert.deepEqual(${actualNode}, ${expectedNode})`;
    }
}