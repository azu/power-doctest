import { createRequire } from "node:module";
import { type Node, transformFromAstSync } from "@babel/core";
import { type ParserOptions, parse, parseExpression } from "@babel/parser";
import { type File, identifier, isExpressionStatement } from "@babel/types";
import {
	ERROR_COMMENT_PATTERN,
	PROMISE_REJECT_COMMENT_PATTERN,
	PROMISE_RESOLVE_COMMENT_PATTERN,
	tryGetCodeFromComments,
	wrapAssert,
	type wrapAssertOptions,
} from "./ast-utils.js";

const require = createRequire(import.meta.url);
const traverse = require("@babel/traverse").default;

function getExpressionNodeFromCommentValue(commentValue: string): { type: string } & { [index: string]: any } {
	// trim and remove trailing semicolon;
	const message = commentValue.trim().replace(/;$/, "");
	if (ERROR_COMMENT_PATTERN.test(message)) {
		const match = message.match(ERROR_COMMENT_PATTERN);
		if (!match) {
			throw new Error(`Can not Parse: // => Error: "message"`);
		}
		return identifier(match[1]);
	}
	if (PROMISE_RESOLVE_COMMENT_PATTERN.test(message)) {
		const match = message.match(PROMISE_RESOLVE_COMMENT_PATTERN);
		if (!match) {
			throw new Error("Can not Parse: // => Resolve: value");
		}
		return {
			type: "Resolve",
			node: getExpressionNodeFromCommentValue(match[1]),
		};
	} else if (PROMISE_REJECT_COMMENT_PATTERN.test(message)) {
		const match = message.match(PROMISE_REJECT_COMMENT_PATTERN);
		if (!match) {
			throw new Error("Can not Parse: // => Reject: value");
		}
		return {
			type: "Reject",
			node: getExpressionNodeFromCommentValue(match[1]),
		};
	}
	try {
		return parseExpression(message);
	} catch (e) {
		console.error(`Can't parse comments // => expression`);
		throw e;
	}
}

export type toAssertFromSourceOptions = {
	babel?: ParserOptions;
} & wrapAssertOptions;

/**
 * transform code to asserted code
 * if want to source map, use toAssertFromAST.
 */
export function toAssertFromSource(code: string, options?: toAssertFromSourceOptions) {
	const ast = parse(code, {
		// parse in strict mode and allow module declarations
		sourceType: "module",
		...(options?.babel ? options.babel : {}),
	});
	if (!ast) {
		throw new Error("Can not parse the code");
	}
	const output = toAssertFromAST(ast, options);
	const babelFileResult = transformFromAstSync(output as Node, code, { comments: true });
	if (!babelFileResult) {
		throw new Error(`can not generate from ast: ${JSON.stringify(output)}`);
	}
	return babelFileResult.code;
}

/**
 * transform AST to asserted AST.
 */
export function toAssertFromAST<T extends File>(ast: T, options: wrapAssertOptions = {}): T {
	const replaceSet = new Set();
	let id = 0;
	traverse(ast, {
		exit(path: any) {
			if (!replaceSet.has(path.node) && path.node.trailingComments) {
				const commentExpression = tryGetCodeFromComments(path.node.trailingComments);
				if (commentExpression) {
					try {
						const commentExpressionNode = getExpressionNodeFromCommentValue(commentExpression);
						const actualNode = isExpressionStatement(path.node) ? path.node.expression : path.node;

						// Check if the node type is valid for assertion
						const nodeType = path.node.type;
						const lineNumber = path.node.loc?.start.line;

						if (
							nodeType === "VariableDeclaration" ||
							nodeType === "FunctionDeclaration" ||
							nodeType === "ClassDeclaration" ||
							nodeType === "ImportDeclaration"
						) {
							throw new Error(
								`Cannot add assertion to ${nodeType}${lineNumber ? ` at line ${lineNumber}` : ""}. ` +
									`Comment assertions (// => ${commentExpression}) can only be added to expressions, not declarations. ` +
									`Try adding the assertion after an expression statement instead.`,
							);
						}

						const replacement = wrapAssert(
							{
								actualNode: actualNode,
								expectedNode: commentExpressionNode,
								commentExpression,
								id: String(`id:${id++}`),
							},
							options,
						);
						if (Array.isArray(replacement)) {
							// prevent ∞ loopf
							path.node.trailingComments = null;
							path.replaceWithMultiple(replacement);
						} else {
							path.replaceWith(replacement);
						}
						replaceSet.add(path.node);
					} catch (error) {
						// If the error already has line information, re-throw it
						if (error instanceof Error && error.message.includes("at line")) {
							throw error;
						}

						// Otherwise, add line information if available
						const lineNumber = path.node.loc?.start.line;
						if (error instanceof Error && lineNumber) {
							throw new Error(`Error at line ${lineNumber}: ${error.message}`);
						}
						throw error;
					}
				}
			}
		},
	});
	return ast;
}
