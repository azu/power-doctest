import { createRequire } from "node:module";
import type { Node } from "@babel/types";

const require = createRequire(import.meta.url);
const traverse = require("@babel/traverse").default;
const template = require("@babel/template").default;

export function injectAssertModule(AST: Node) {
	traverse(AST, {
		Program: {
			enter(path: any) {
				path.unshiftContainer("body", template`var assert = require("power-assert")`());
			},
		},
	});
	return AST;
}
