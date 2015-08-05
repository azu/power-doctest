// LICENSE : MIT
"use strict";
import {parse} from "esprima"
import {generate} from "escodegen"
import estraverse from "estraverse"
import {
    tryGetCodeFromComments,
    wrapAssert
    } from "./ast-utils"
export function commentToAssertFromCode(code) {
    return code;
}
export function commentToAssertFromAST(ast) {
    estraverse.replace(ast, {
        enter: function (node, parent) {
            if (node.trailingComments) {
                let commentExpression = tryGetCodeFromComments(node.trailingComments);
                if (commentExpression) {
                    let commentExpressionAST = parse(commentExpression);
                    return wrapAssert(node, commentExpressionAST.body[0].expression);
                }
            }
        }
    });
    return ast;
}
