// LICENSE : MIT
var esprima = require("esprima");
var rocambole = require('rocambole');
var escodegen = require("escodegen");
var estraverse = require("estraverse");
var _ = require("lodash");
var clone = require("clone");


var astUtil = {
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
    }
};
var power = {
    // ignore space termination;
    isIgnoreNode: function (node) {
        return astUtil.isSemicolon(node) || astUtil.isWhiteSpace(node);
    },
    nextElementSibling: function (node) {
        var token = node.endToken;
        var target = token.next;
        if (typeof target === "undefined") {
            return undefined;
        }
        while (target.next && (power.isIgnoreNode(target.next))) {
            target = target.next;
        }
        return target.next || target;
    },
    nextCommentSibling: function (node) {
        var token = node.startToken;
        var target = token.next;
        if (typeof target === "undefined") {
            return undefined;
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
        while (target.prev && (power.isIgnoreNode(target.prev))) {
            target = target.prev;
        }
        return target.prev;
    },
    setPrev: function (node, newNode) {
        var target = node.prev;
        while (target.prev && (power.isIgnoreNode(target.prev))) {
            target = target.prev;
        }
        target.prev = newNode;
    },
    isExpression: function (node) {
        return node.type === "ExpressionStatement";
    },
    isExecute: /\s+>\s+(.*)$/,
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
        var tree = esprima.parse(result);
        return tree.body[0].expression;
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
    return escodegen.generate(convertTree(ast));
};
var convertFromCodeToTree = function (code) {
    return convertTree(rocambole.parse(code, {
        loc: true
    }));
};
var convertCode = function (code) {
    return escodegen.generate(convertFromCodeToTree(code));
};
var regexpExecuted = function (regexp) {
    power.isExecute = regexp;
};
// execute comment pattern -  defaults : /\s+>\s+(.*)$/
exports.regexpExecuted = regexpExecuted;
exports.convertCode = convertCode;
exports.convertTree = convertTree;
exports.convertFromTreeToCode = convertFromTreeToCode;
exports.convertFromCodeToTree = convertFromCodeToTree;
var runDocTest = function (code) {
    var resolveModule = function (module) {
        if (module.charAt(0) !== '.') {
            return module;
        }
        return path.resolve(path.dirname(filePath), module);
    };
    var mocks = {};
    var context = {
        require: function (name) {
            return mocks[name] || require(resolveModule(name));
        },
        console: console,
        exports: exports,
        module: {
            exports: exports
        }
    };
    var espower = require('espower');
    var reCode = convertCode(code);
    var jsAst = esprima.parse(reCode, {tolerant: true, loc: true, range: true});
    var espowerOptions = {
        source: reCode
    };
    var modifiedAst = espower(jsAst, espowerOptions);
    try {
        require("vm").runInNewContext(escodegen.generate(modifiedAst, {
            sourceMapWithCode: false
        }), context);
    } catch (e) {
        console.log(e.message);
    }
};
exports.runDocTest = runDocTest;