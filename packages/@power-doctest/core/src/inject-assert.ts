// LICENSE : MIT
"use strict";
import traverse from "@babel/traverse";
import template from "@babel/template";
import { Node } from "@babel/types";

export function injectAssertModule(AST: Node) {
    traverse(AST, {
        Program: {
            enter(path) {
                (path as any).unshiftContainer("body", template`var assert = require("power-assert")`());
            }
        }
    });
    return AST;
}
