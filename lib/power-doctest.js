// LICENSE : MIT
"use strict";
var esprima = require("esprima");
var rocambole = require('rocambole');
var escodegen = require("escodegen");
var estraverse = require("estraverse");
var _ = require("lodash");
var clone = require("clone");

var EventEmitter = require('events').EventEmitter;
var eventEmitter = new EventEmitter;
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
    isObjectLiteral: function (node) {
        return node.type === "ArrayExpression" || node.type === "ObjectExpression";
    },
    isErrorObject: function (node) {
        if (node.type === "CallExpression" && node["callee"].type === "Identifier" && node["callee"].name === "Error") {
            return true;
        } else if (node.type === "Identifier" && node.name === "Error") {
            return true;
        }
        return false;
    },
    isExpression: function (node) {
        return node.type === "ExpressionStatement";
    },
    isThrowStatement: function (node) {
        return node.type === "ThrowStatement";
    },
    containObjectLiteral: function (targetNode) {
        var result = false;
        estraverse.traverse(targetNode, {
            enter: function (node, parent) {
                if (astUtil.isObjectLiteral(node)) {
                    result = true;
                    this.break();
                }
            }
        });
        return result;
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
            console.error(e);
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
    getCodeFromComment: function (node, regexpExecuted) {
        var match = node.value.match(regexpExecuted);
        return match[1];
    },
    getCommentAsExpression: function (node, regexpExecuted) {
        var match = node.value.match(regexpExecuted);
        var result = match[1];

        return astUtil.parseAsExpression(result);
    },
    replaceNode: function replaceNode(node, newNode) {
        astUtil.replace(node, newNode);
    }
};

function getDefaultOptions() {
    return {
        // http://refiddle.com/by/efcl/power-doctest
        regexpExecuted: /\s*?[=-]?>\s(.*)$/,
        reporter: require("./reporter/simple-reporter"),
        astGenerator: require("./ast-generator/mixin-assert"),
        astErrorGenerator: require("./ast-generator/exception-assert"),
        // https://github.com/Constellation/escodegen/wiki/API#optionverbatim
        verbatimActualExpression: true,
        verbatimExpectExpression: false
    };
}
function getOptions(options) {
    return _.extend(getDefaultOptions(), (options || {}));
}

function logError(node, message) {
    if (node) {
        console.error(message);
    } else {
        console.error(message);
    }
    process.exit(1);
}

/**
 *
 * @param {String} code
 * @param {Object} ast
 * @param {Object} options
 * @param options.regexpExecuted
 * @returns {*}

 */
var convertTree = function (code, ast, options) {
    options = getOptions(options);
    var astGenerator = options.astGenerator;
    var astErrorGenerator = options.astErrorGenerator;

    rocambole.recursive(ast, function (node) {
        if (astUtil.isExpression(node) || astUtil.isThrowStatement(node)) {
            var nextElement = power.nextElementSibling(node);
            if (nextElement && power.isDocComment(nextElement, options.regexpExecuted)) {
                var commentExpression = power.getCommentAsExpression(nextElement, options.regexpExecuted);
                var actualCode = code.substring(node.range[0], node.range[1]);
                actualCode = actualCode.replace(/[;,]+$/, "");
                var expectedCode = power.getCodeFromComment(nextElement, options.regexpExecuted);

                if (options.verbatimActualExpression) {
                    var isContainObjectLiteral = astUtil.containObjectLiteral(node);
                    if (isContainObjectLiteral) {
                        node.expression['x-verbatim-property'] = actualCode;
                    }
                }
                if (options.verbatimExpectExpression) {
                    commentExpression['x-verbatim-property'] = expectedCode;
                }
                var nodeForReplace;
                if (astUtil.isErrorObject(commentExpression)) {
                    nodeForReplace = astErrorGenerator(node, commentExpression, {
                        actual: actualCode,
                        expected: expectedCode
                    });
                } else {
                    // throw doesn't support...
                    if (astUtil.isThrowStatement(node)) {
                        eventEmitter.emit("parse-error", node, "ThrowStatement support only when Error doctest.");
                    }
                    nodeForReplace = astGenerator(node, commentExpression, {
                        actual: actualCode,
                        expected: expectedCode
                    });
                }
                if (nodeForReplace) {
                    power.replaceNode(node, nodeForReplace);
                }
            }
        }
    });
    return ast;
};
function formattedCode(convertedAST) {
    return escodegen.generate(convertedAST, {
        verbatim: 'x-verbatim-property'
    });
}

var convertFromCodeToTree = function (code, options) {
    return convertTree(code, rocambole.parse(code, {
        loc: true
    }), options);
};
var convertCode = function (code, options) {
    var convertedAST = convertFromCodeToTree(code, options);
    return formattedCode(convertedAST);
};
function powerizeCode(code, options) {
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
    var generated = escodegen.generate(modifiedAst);
    return {context: context, generated: generated};
}
function runDocTest(source, options) {
    eventEmitter.on("parse-error", function (node, message) {
        var logPath = [source.filePath, node.loc.start.line, node.loc.start.column].join(":");
        console.error(logPath + "\n" + message);
    });
    options = getOptions(options);
    var __ret = powerizeCode(source.fileData, options);
    var context = __ret.context;
    var generated = __ret.generated;
    var resultError = [];
    try {
        require("vm").runInNewContext(generated, context);
    } catch (error) {
        // When unexpected error
        if (error.name !== "AssertionError") {
            throw error;
        }
        error.filePath = source.filePath;
        resultError.push(error);
    }
    eventEmitter.removeAllListeners("parse-error");
    return resultError;
}

function printTestResult(results, options) {
    options = getOptions(options);
    var reporter = options.reporter;
    var output = reporter(results, options);
    console.log(output);
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
exports.convertFromCodeToTree = convertFromCodeToTree;
exports.runDocTest = runDocTest;
exports.printTestResult = printTestResult;
exports.insertAssertModule = insertAssertModule;