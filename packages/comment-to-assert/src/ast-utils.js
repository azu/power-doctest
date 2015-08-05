// LICENSE : MIT
"use strict";
import {parse} from "esprima"
import {generate} from "escodegen"
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
    var concatAST = parse(concatCode);
    return concatAST;
}

export function wrapAssert(node) {
    return toAST`assert(${node})`;
}