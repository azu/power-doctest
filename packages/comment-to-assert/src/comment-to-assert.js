// LICENSE : MIT
"use strict";
import {parse} from "esprima"
import {generate} from "escodegen"
import estraverse from "estraverse"
import {tryGetCodeFromComments} from "./ast-utils"
export function commentToAssertFromCode(code) {
    return code;
}
export function commentToAssertFromAST(ast) {
    estraverse.traverse(ast, {
        enter: function (node, parent) {
            if (node.trailingComments) {
                let commentExpression = tryGetCodeFromComments(node.trailingComments);
                if (commentExpression) {
                    console.log(commentExpression);

                }
            }
        }
    });
    return ast;
}
