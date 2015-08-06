// LICENSE : MIT
"use strict";
import assert from "assert"
import {parse} from "esprima"
import {generate} from "escodegen"
import estraverse from "estraverse"
import {
    tryGetCodeFromComments,
    wrapAssert
} from "./ast-utils"
/**
 * transform code to asserted code
 * if want to source map, use toAssertFromAST.
 * @param {string} code
 * @returns {string}
 */
export function toAssertFromSource(code) {
    var parseOption = {
        loc: true,
        range: true,
        comment: true,
        attachComment: true
    };
    var generateOption = {
        comment: true,
        sourcemap: true
    };
    var AST = parse(code, parseOption);
    var modifiedAST = toAssertFromAST(AST);
    return generate(modifiedAST, generateOption);
}
/**
 * transform AST to asserted AST.
 * @param {ESTree.Node} ast
 * @returns {ESTree.Node}
 */
export function toAssertFromAST(ast) {
    assert(ast && typeof ast.comments !== "undefined", "AST must has to comments nodes");
    estraverse.replace(ast, {
        enter: function (node) {
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