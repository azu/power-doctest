// LICENSE : MIT
"use strict";
import { ParseResult } from "@babel/core"
import traverse from "@babel/traverse"
import template from "@babel/template"

export function injectAssertModule(AST: ParseResult) {
    traverse(AST, {
        Program: {
            enter(path) {
                (path as any).unshiftContainer("body", template`var assert = require("power-assert")`())
            }
        }
    });
    return AST;
}
