/**
 * Created by azu on 2013/11/30.
 */
var esprima = require("esprima");
var rocambole = require('rocambole');
var escodegen = require("escodegen");
var estraverse = require("estraverse");
var _ = require("lodash");
var clone = require("clone");
function after(target, newToken) {
    if (target.next) {
        target.next.prev = newToken;
    } else if (target.root) {
        target.root.endToken = newToken;
    }
    newToken.prev = target;
    newToken.next = target.next;
    target.next = newToken;
}
function replace(target, newToken) {
    if (target.next) {
        target.next.prev = newToken;
    } else if (target.root) {
        target.root.endToken = newToken;
    }
    newToken.prev = target;
    newToken.next = target.next;
    target = newToken;
    return target;
}
function remove(target) {
    if (target.next) {
        target.next.prev = target.prev;
    } else if (target.root) {
        target.root.endToken = target.prev;
    }

    if (target.prev) {
        target.prev.next = target.next;
    } else if (target.root) {
        target.root.startToken = target.next;
    }
}

function traverse(node, nodeWalk) {
    var token = node.startToken;
    while (token !== node.endToken.next) {
        nodeWalk(token);
        token = token.next;
    }
}

var astUtil = {
    isWhiteSpace: function isWhiteSpace(node) {
        return node.type === "WhiteSpace";
    },
    isSemicolon: function isSemicolon(node) {
        return node.type === "Punctuator" && node.value === ";";
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
function update(node, str) {
    var newToken = {
        "type": "ExpressionStatement",
        "expression": {
            "type": "Identifier",
            "name": str
        }
    };
    // update linked list references
    if (node.startToken.prev) {
        node.startToken.prev.next = newToken;
        newToken.prev = node.startToken.prev;
    }
    if (node.endToken.next) {
        node.endToken.next.prev = newToken;
        newToken.next = node.endToken.next;
    }
    node.startToken = node.endToken = newToken;
}

function removeNodesFromAST(tree, removeNodes) {
    estraverse.replace(tree, {
        enter: function (node, parent) {
            _.forEach(removeNodes, function (deleteNode) {
                _.forEach(parent.body, function (currentNode, iterator) {
                    if (currentNode === deleteNode) {
                        parent.body.splice(iterator, 1);
                    }
                });
            })
        }
    });
}

var convertTree = function (ast) {
    rocambole.recursive(ast, function (node) {
        if (power.isExpression(node)) {
            console.log("node", node);
            var nextElement = power.nextElementSibling(node);
            if (nextElement && power.isDocComment(nextElement)) {
                var commentAsExpression = power.getCommentAsExpression(nextElement);
                console.log("commentAsExpression", commentAsExpression);
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
    return convertTree(rocambole.parse(code));
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
