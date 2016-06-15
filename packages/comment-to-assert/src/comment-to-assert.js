// LICENSE : MIT
"use strict";
import {parse} from "acorn"
import escodegen from "escodegen"
import estraverse from "estraverse"
import {
    tryGetCodeFromComments,
    wrapAssert
} from "./ast-utils"
/**
 * transform code to asserted code
 * if want to source map, use toAssertFromAST.
 * @param {string} code
 * @param {string} filePath
 * @returns {string}
 */
export function toAssertFromSource(code, filePath) {
    const comments = [];
    const tokens = [];
    const ast = parse(code, {
        filePath: filePath,
        ecmaVersion: 7,
        sourceType: "module",
        ranges: true,
        onComment: comments,
        onToken: tokens
    });
    escodegen.attachComments(ast, comments, tokens);
    const output = toAssertFromAST(ast);
    return escodegen.generate(output, {comment: true});
}

/**
 * transform AST to asserted AST.
 * @param {ESTree.Node} ast
 * @returns {ESTree.Node}
 */
export function toAssertFromAST(ast) {
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