// LICENSE : MIT
"use strict";
var esprima = require("esprima");
var rocambole = require('rocambole');
var escodegen = require("escodegen");
var estraverse = require("estraverse");
var Promise = require("bluebird");
var _ = require("lodash");

var EventEmitter = require('events').EventEmitter;
var eventEmitter = new EventEmitter;
var astUtil = {
    isEmpty: function (token) {
        return token && (token.type === 'WhiteSpace' ||
            token.type === 'LineBreak' ||
            token.type === 'Indent');
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
    isConsoleObject: function (node) {
        /*
                "type": "CallExpression",
                "callee": {
                    "type": "MemberExpression",
                    "computed": false,
                    "object": {
                        "type": "Identifier",
                        "name": "console"
                    },
                    "property": {
                        "type": "Identifier",
                        "name": "log"
                    }
                },
         */
        var expression = node.expression;
        if (node.type === "ExpressionStatement" && expression.type === "CallExpression" &&
            expression["callee"].type === "MemberExpression" && expression["callee"]["object"].name === "console") {
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
        verbatimExpectExpression: false,
        isDebug: false,
        extractConsole: false
    };
}
function getOptions(options) {
    return _.extend(getDefaultOptions(), (options || {}));
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
    var clone = require("clone");
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

                if (options.extractConsole) {
                    if (astUtil.isConsoleObject(node)) {
                        node = require("../lib/ast-generator/extract-console")(node);
                    }
                }

                var nodeForReplace = null;
                if (astUtil.isErrorObject(commentExpression)) {
                    nodeForReplace = astErrorGenerator(clone(node), commentExpression, {
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
    var ast;
    try {
        ast = rocambole.parse(code, {
            loc: true
        });
    } catch (error) {
        eventEmitter.emit("parse-error", error);
    }
    if (ast) {
        return convertTree(code, ast, options);
    }
};
var convertCode = function (code, options) {
    var convertedAST = convertFromCodeToTree(code, options);
    if (!convertedAST) {
        throw Error("Parse Error");
    }
    return formattedCode(convertedAST);
};
function powerizeCode(source, options) {
    var path = require("path");
    var resolveModule = function (module) {
        if (module.charAt(0) !== '.') {
            return module;
        }
        return path.resolve(path.dirname(filePath), module);
    };
    var originalAssert = require("power-assert");
    var mocks = {};
    var context = {
        require: function (name) {
            return mocks[name] || require(resolveModule(name));
        },
        console: console,
        global: global,
        assert: originalAssert,
        exports: exports,
        module: {
            exports: exports
        }
    };
    for (var k in global) {
        context[k] = global[k];
    }
    var espower = require('espower');
    var reCode = convertCode(source, options);
    var jsAst = esprima.parse(reCode, {loc: true, range: true});
    var assertCount = require("./count-method").countMethodCall(jsAst, "assert");
    var espowerOptions = {
        source: reCode
    };
    var modifiedAst = espower(jsAst, espowerOptions);
    var generated = escodegen.generate(modifiedAst);
    return {context: context, generated: generated, assertCount: assertCount / 2};

}
function runDocTestAsPromise(source, options) {
    eventEmitter.on("parse-error", function (node, message) {
        if (node instanceof Error) {
            console.error(node.message);
        } else if (typeof node === "object") {
            var logPath = [source.filePath, node.loc.start.line, node.loc.start.column].join(":");
            console.error(logPath + "\n" + message);
        } else {
            console.error(node);
        }
    });
    function removeAllListeners(value) {
        eventEmitter.removeAllListeners("parse-error");
        return value
    }

    options = getOptions(options);
    var __ret = powerizeCode(source, options);
    var context = __ret.context;
    var generated = __ret.generated;
    var assertCount = __ret.assertCount;
    if (options.isDebug) {
        console.info("====== Generated Code ==========\n", generated, "\n====== /Generated Code ==========");
    }
    var domain = require('domain');
    var vmDoamin = domain.create();
    var promise = new Promise(function (resolve, reject) {
        var calledCount = 0;

        function assertCallback() {
            calledCount += 1;
            if (calledCount === assertCount) {
                resolve(calledCount);
            }
        }

        // spy-callback after
        var assertOK = context.assert.ok;
        var deepEqual = context.assert.deepEqual;
        context.assert.ok = function () {
            assertOK.apply(context.assert, arguments);
            assertCallback();
        };
        context.assert.deepEqual = function () {
            deepEqual.apply(context.assert, arguments);
            assertCallback();
        };
        vmDoamin.on('error', function (error) {
            if (error.name !== "AssertionError") {
                return reject(error);
            }
            var filteredError = filterPowerAssertMessage(error);
            filteredError.filePath = options.filePath;
            reject(filteredError);
        });
        vmDoamin.run(function () {
            require("vm").runInNewContext(generated, context);
        });
        // has not `assert`
        if (assertCount === 0) {
            return resolve(0);
        }
    });
    return promise.then(removeAllListeners, removeAllListeners);

}
function filterPowerAssertMessage(error) {
    var messages = error.message.split("\n");
    var firstLine = messages[0];
    if (/^\s*#/.test(firstLine)) {
        messages.shift();
    }
    error.message = messages.join("\n");
    return error;
}

function printTestResult(error, value, options) {
    options = getOptions(options);
    var reporter = options.reporter;
    var output = reporter(error, value, options);
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
exports.runDocTestAsPromise = runDocTestAsPromise;
exports.printTestResult = printTestResult;
exports.insertAssertModule = insertAssertModule;