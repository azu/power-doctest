// LICENSE : MIT
"use strict";
import { Node } from "@babel/types";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const traverse = require("@babel/traverse").default;
const template = require("@babel/template").default;

export function injectAssertModule(AST: Node) {
    traverse(AST, {
        Program: {
            enter(path: any) {
                path.unshiftContainer("body", template`var assert = require("power-assert")`());
            }
        }
    });
    return AST;
}
