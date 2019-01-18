// LICENSE : MIT
"use strict";
const espree = require("espree");
import escodegen from "escodegen";
import estraverse from "estraverse";
import { ERROR_COMMENT_PATTERN, PROMISE_COMMENT_PATTERN, tryGetCodeFromComments, wrapAssert } from "./ast-utils";
import { Syntax } from "estraverse";

const parseOptions = {
    // attach range information to each node
    range: true,
    // attach line/column location information to each node
    loc: true,
    // create a top-level comments array containing all comments
    comment: true,
    // attach comments to the closest relevant node as leadingComments and
    // trailingComments
    attachComment: true,
    // create a top-level tokens array containing all tokens
    tokens: true,
    // specify the language version (3, 5, 6, or 7, default is 5)
    ecmaVersion: 6,
    // specify which type of script you're parsing (script or module, default is script)
    sourceType: "module",
    // specify additional language features
    ecmaFeatures: {
        // enable JSX parsing
        jsx: true,
        // enable return in global scope
        globalReturn: true,
        // enable implied strict mode (if ecmaVersion >= 5)
        impliedStrict: true,
        // allow experimental object rest/spread
        experimentalObjectRestSpread: true
    }
};

/**
 * transform code to asserted code
 * if want to source map, use toAssertFromAST.
 * @param {string} code
 * @param {string} filePath
 * @returns {string}
 */
export function toAssertFromSource(code, filePath) {
    const ast = espree.parse(code, parseOptions);
    const output = toAssertFromAST(ast);
    return escodegen.generate(output, { comment: true });
}

function getExpressionNodeFromCommentValue(string) {
    const message = string.trim();
    if (ERROR_COMMENT_PATTERN.test(message)) {
        const match = message.match(ERROR_COMMENT_PATTERN);
        return {
            type: Syntax.Identifier,
            name: match[1]
        };
    }
    if (PROMISE_COMMENT_PATTERN.test(message)) {
        const match = message.match(PROMISE_COMMENT_PATTERN);
        return {
            type: "Promise",
            value: getExpressionNodeFromCommentValue(match[1])
        };
    }
    // support { } object literal
    const commentExpression = `0, ${string}`;
    try {
        const AST = espree.parse(commentExpression, parseOptions);
        return AST.body[0].expression.expressions[1];
    } catch (e) {
        console.error(`Can't parse comments // => expression`);
        console.error(e);
    }
}

/**
 * transform AST to asserted AST.
 * @param {ESTree.Node} ast
 * @returns {ESTree.Node}
 */
export function toAssertFromAST(ast) {
    estraverse.replace(ast, {
        enter: function(node) {
            if (node.trailingComments) {
                const commentExpression = tryGetCodeFromComments(node.trailingComments);
                if (commentExpression) {
                    const commentExpressionNode = getExpressionNodeFromCommentValue(commentExpression);
                    return wrapAssert(node, commentExpressionNode);
                }
            }
        }
    });
    return ast;
}
