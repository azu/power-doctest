// LICENSE : MIT
"use strict";
var esprima = require("esprima");
var rocambole = require('rocambole');
var escodegen = require("escodegen");
var estraverse = require("estraverse");
var escope = require('escope');
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
    /*
        regexpExecuted is used to get expression from comment.
        e.g.)
        // => expression
        We use /\s*?[=-]?>\s*?(.*)$/ in order to expression.
    */
    isDocComment: function (node, regexpExecuted) {
        if (node.type === "LineComment" || node.type === "BlockComment") {
            if (regexpExecuted.test(node.value)) {
                return node;
            }
        }
    },
    getCommentAsExpression: function (node, regexpExecuted) {
        var match = node.value.match(regexpExecuted);
        var result = match[1];
        return astUtil.parseAsExpression(result);
    },
    replaceAlt: function (node, commentExpression) {
        var loc = node.loc;
        astUtil.replace(node, {
            "type": "ExpressionStatement",
            "expression": {
                "type": "CallExpression",
                "callee": {
                    "type": "Identifier",
                    "name": "__doctest"
                },
                "arguments": [
                    node.expression,
                    commentExpression,
                    {
                        "type": "ObjectExpression",
                        "properties": [
                            {
                                "type": "Property",
                                "key": {
                                    "type": "Identifier",
                                    "name": "start"
                                },
                                "value": {
                                    "type": "ObjectExpression",
                                    "properties": [
                                        {
                                            "type": "Property",
                                            "key": {
                                                "type": "Identifier",
                                                "name": "column"
                                            },
                                            "value": {
                                                "type": "Literal",
                                                "value": loc.start.column,
                                                "raw": String(loc.start.column)
                                            },
                                            "kind": "init"
                                        },
                                        {
                                            "type": "Property",
                                            "key": {
                                                "type": "Identifier",
                                                "name": "line"
                                            },
                                            "value": {
                                                "type": "Literal",
                                                "value": loc.start.line,
                                                "raw": String(loc.start.line)
                                            },
                                            "kind": "init"
                                        }
                                    ]
                                },
                                "kind": "init"
                            },
                            {
                                "type": "Property",
                                "key": {
                                    "type": "Identifier",
                                    "name": "end"
                                },
                                "value": {
                                    "type": "ObjectExpression",
                                    "properties": [
                                        {
                                            "type": "Property",
                                            "key": {
                                                "type": "Identifier",
                                                "name": "column"
                                            },
                                            "value": {
                                                "type": "Literal",
                                                "value": loc.end.column,
                                                "raw": String(loc.end.column)
                                            },
                                            "kind": "init"
                                        },
                                        {
                                            "type": "Property",
                                            "key": {
                                                "type": "Identifier",
                                                "name": "line"
                                            },
                                            "value": {
                                                "type": "Literal",
                                                "value": loc.end.line,
                                                "raw": String(loc.end.line)
                                            },
                                            "kind": "init"
                                        }
                                    ]
                                },
                                "kind": "init"
                            }
                        ]}
                ]
            }
        });
    },
    replaceNode: function replaceNode(node, newNode) {
        astUtil.replace(node, newNode);
    },
    // replace `node` to `assert(node.expression === commentExpression);`
    replaceToAssert: function replaceToAssert(node, commentExpression) {
        var astBuilder = require("./ast-generator/simple-assert");
        astUtil.replace(node, astBuilder(node, commentExpression));
    },
    // replace `node` to `assert.deepEqual(node.expression , commentExpression);`
    replaceToDeepEqual: function replaceToDeepEqual(node, commentExpression) {
        astUtil.replace(node, {
            "type": "ExpressionStatement",
            "expression": {
                "type": "CallExpression",
                "callee": {
                    "type": "MemberExpression",
                    "computed": false,
                    "object": {
                        "type": "Identifier",
                        "name": "assert"
                    },
                    "property": {
                        "type": "Identifier",
                        "name": "deepEqual"
                    }
                },
                "arguments": [
                    node.expression,
                    commentExpression
                ]
            }
        });
    }

};

function getDefaultOptions() {
    return {
        // http://refiddle.com/by/efcl/power-doctest
        regexpExecuted: /\s*?[=-]?>\s*?(.*)$/,
        astGenerator: require("./ast-generator/simple-assert")
    };
}
/**
 *
 * @param ast
 * @param options
 * @param options.regexpExecuted
 * @returns {*}
 */
var convertTree = function (ast, options) {
    options = _.extend(getDefaultOptions(), (options || {}));
    var astGenerator = options.astGenerator;
    rocambole.recursive(ast, function (node) {
        if (power.isExpression(node)) {
            var nextElement = power.nextElementSibling(node);
            if (nextElement && power.isDocComment(nextElement, options.regexpExecuted)) {
                var commentExpression = power.getCommentAsExpression(nextElement, options.regexpExecuted);
                var nodeForReplace = astGenerator(node, commentExpression);
                if (nodeForReplace) {
                    power.replaceNode(node, nodeForReplace);
                }
            }
        }
    });
    return ast;
};
function formattedCode(convertedAST) {
    var injectFn = require('fs').readFileSync(__dirname + "/doctest_fn.js", "utf-8");
    //    convertedAST.body.unshift(esprima.parse(injectFn));
    // FIXME : convertTree.toString() wasn't reflected convert AST tree...
    var reCode = escodegen.generate(convertedAST);
    return require('esformatter').format(reCode);
}
var convertFromTreeToCode = function (ast, options) {
    var convertedAST = convertTree(ast, options);
    return formattedCode(convertedAST);
};

var convertFromCodeToTree = function (code, options) {
    return convertTree(rocambole.parse(code, {
        loc: true
    }), options);
};
var convertCode = function (code, options) {
    var convertedAST = convertFromCodeToTree(code, options);
    return formattedCode(convertedAST);
};
function runDocTest(code, options) {
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
    var reCode = convertCode(code, options);
    var jsAst = esprima.parse(reCode, {tolerant: true, loc: true, range: true});
    var espowerOptions = {
        source: reCode
    };
    var modifiedAst = espower(jsAst, espowerOptions);
    var resultError;
    var generated = escodegen.generate(modifiedAst);
    try {
        require("vm").runInNewContext(generated, context);
    } catch (e) {
        resultError = e;
    }

    return resultError;
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
// options
exports.convertCode = convertCode;
exports.convertTree = convertTree;
exports.convertFromTreeToCode = convertFromTreeToCode;
exports.convertFromCodeToTree = convertFromCodeToTree;
exports.runDocTest = runDocTest;
exports.insertAssertModule = insertAssertModule;