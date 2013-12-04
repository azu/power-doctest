// LICENSE : MIT
"use strict";
var esprima = require("esprima");
var rocambole = require('rocambole');
var escodegen = require("escodegen");
var estraverse = require("estraverse");
var _ = require("lodash");
var clone = require("clone");


var astUtil = {
    isEmpty: function (token) {
        return token && (token.type === 'WhiteSpace' ||
            token.type === 'LineBreak' ||
            token.type === 'Indent');
    },
    isWhiteSpace: function isWhiteSpace(node) {
        return node.type === "WhiteSpace";
    },
    isSemicolon: function isSemicolon(node) {
        return node.type === "Punctuator" && node.value === ";";
    },
    insert: function (currentNode, newNode) {
        estraverse.replace(currentNode.parent, {
            enter: function (node, parent) {
                if (node === currentNode) {
                    return newNode;
                }
            }
        });
    },
    replace: function (currentNode, newNode) {
        estraverse.replace(currentNode.parent, {
            enter: function (node, parent) {
                if (node === currentNode) {
                    return newNode;
                }
            }
        });
    },
    parseAsExpression: function (code) {
        var ast;
        try {
            ast = esprima.parse("!" + code);
        } catch (e) {
            console.log("e", e);
        }
        return ast.body[0].expression.argument;
    }
};
var power = {
    // ignore space termination;
    isIgnoreNode: function (node) {
        return astUtil.isSemicolon(node) || astUtil.isEmpty(node);
    },
    nextElementSibling: function (node) {
        var token = node.endToken;
        var target = token.next;
        if (typeof target === "undefined") {
            return undefined;
        }
        if (!power.isIgnoreNode(target)) {
            return target;
        }
        while (target.next && (power.isIgnoreNode(target.next))) {
            target = target.next;
        }
        return target.next || target;
    },
    previousElementSibling: function (node) {
        var target = node.prev;
        if (typeof target === "undefined") {
            return undefined;
        }
        if (!power.isIgnoreNode(target)) {
            return target;
        }
        while (target.prev && (power.isIgnoreNode(target.prev))) {
            target = target.prev;
        }
        return target.prev;
    },
    isExpression: function (node) {
        return node.type === "ExpressionStatement";
    },
    // http://refiddle.com/by/efcl/power-doctest
    isExecute: /\s*?[=-]?>\s*?(.*)$/,
    isDocComment: function (node) {
        if (node.type === "LineComment" || node.type === "BlockComment") {
            if (power.isExecute.test(node.value)) {
                return node;
            }
        }
    },
    getCommentAsExpression: function (node) {
        var match = node.value.match(power.isExecute);
        var result = match[1];
        return astUtil.parseAsExpression(result);
    }
};

var convertTree = function (ast) {
    rocambole.recursive(ast, function (node) {
        if (power.isExpression(node)) {
            var nextElement = power.nextElementSibling(node);
            if (nextElement && power.isDocComment(nextElement)) {
                var commentAsExpression = power.getCommentAsExpression(nextElement);
                astUtil.replace(node, {
                    "type": "ExpressionStatement",
                    "expression": {
                        "type": "CallExpression",
                        "callee": {
                            "type": "Identifier",
                            "name": "assert"
                        },
                        "arguments": [
                            {
                                "type": "BinaryExpression",
                                "operator": "===",
                                "left": node.expression,
                                "right": commentAsExpression
                            }
                        ]
                    }
                });
            }
        }
    });
    return ast;
};
var convertFromTreeToCode = function (ast) {
    var convertedAST = convertTree(ast);
    // FIXME : convertTree.toString() wasn't reflected convert AST tree...
    var reCode = escodegen.generate(convertedAST);
    return require('esformatter').format(reCode);
};
var convertFromCodeToTree = function (code) {
    return convertTree(rocambole.parse(code, {
        loc: true
    }));
};
var convertCode = function (code) {
    var convertedAST = convertFromCodeToTree(code);
    var reCode = escodegen.generate(convertedAST);
    return require('esformatter').format(reCode);
};
var regexpExecuted = function (regexp) {
    power.isExecute = regexp;
};
function runDocTest(code) {
    var resolveModule = function (module) {
        if (module.charAt(0) !== '.') {
            return module;
        }
        return path.resolve(path.dirname(filePath), module);
    };
    var assert = require("power-assert");
    var mocks = {};
    var context = {
        require: function (name) {
            return mocks[name] || require(resolveModule(name));
        },
        console: console,
        assert: assert,
        exports: exports,
        module: {
            exports: exports
        }
    };
    var espower = require('espower');
    var reCode = convertCode(code);
    console.log("reCode", reCode);
    var jsAst = esprima.parse(reCode, {tolerant: true, loc: true, range: true});
    var espowerOptions = {
        source: reCode
    };
    var modifiedAst = espower(jsAst, espowerOptions);
    var result;
    var generated = escodegen.generate(modifiedAst);
    try {
        require("vm").runInNewContext(generated, context);
    } catch (e) {
        result = e.message;
    }

    return result;
}
function insertAssertModule(ast) {
    ast.body.unshift({
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
    });
    return ast;
}
exports.regexpExecuted = regexpExecuted;
exports.convertCode = convertCode;
exports.convertTree = convertTree;
exports.convertFromTreeToCode = convertFromTreeToCode;
exports.convertFromCodeToTree = convertFromCodeToTree;
exports.runDocTest = runDocTest;
exports.insertAssertModule = insertAssertModule;