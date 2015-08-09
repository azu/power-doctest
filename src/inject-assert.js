// LICENSE : MIT
"use strict";
import traverse from "estraverse"
import {Syntax} from "estraverse"
export function injectAssertModule(AST) {
    var powerAssertDeclaration = {
        "type": "VariableDeclaration",
        "declarations": [
            {
                "type": "VariableDeclarator",
                "id": {
                    "type": "Identifier",
                    "name": "assert"
                },
                "init": {
                    "type": "CallExpression",
                    "callee": {
                        "type": "Identifier",
                        "name": "require"
                    },
                    "arguments": [
                        {
                            "type": "Literal",
                            "value": "power-assert",
                            "raw": "\"power-assert\""
                        }
                    ]
                }
            }
        ],
        "kind": "var"
    };
    AST.body.unshift(powerAssertDeclaration);
    return AST;
}