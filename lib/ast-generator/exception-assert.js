var esprima = require("esprima");
var escodegen = require("escodegen");
var fs = require("fs");
var clone = require("clone");

function exceptionGenerator(node, commentExpression, code) {
    var loc = clone(node.loc);
    var actualCode = code["actual"];
    var expectedCode = code["expected"];
    var actualExpression = clone(node);
    var expectedExpression = clone(commentExpression);
    return {
        "type": "ExpressionStatement",
        "expression": {
            "type": "CallExpression",
            "callee": {
                "type": "FunctionExpression",
                "id": null,
                "params": [],
                "defaults": [],
                "body": {
                    "type": "BlockStatement",
                    "body": [
                        {
                            "type": "VariableDeclaration",
                            "declarations": [
                                {
                                    "type": "VariableDeclarator",
                                    "id": {
                                        "type": "Identifier",
                                        "name": "result"
                                    },
                                    "init": {
                                        "type": "Literal",
                                        "value": false,
                                        "raw": "false"
                                    }
                                }
                            ],
                            "kind": "var"
                        },
                        {
                            "type": "VariableDeclaration",
                            "declarations": [
                                {
                                    "type": "VariableDeclarator",
                                    "id": {
                                        "type": "Identifier",
                                        "name": "localError"
                                    },
                                    "init": null
                                }
                            ],
                            "kind": "var"
                        },
                        {
                            "type": "VariableDeclaration",
                            "declarations": [
                                {
                                    "type": "VariableDeclarator",
                                    "id": {
                                        "type": "Identifier",
                                        "name": "expected"
                                    },
                                    "init": expectedExpression
                                }
                            ],
                            "kind": "var"
                        },
                        {
                            "type": "TryStatement",
                            "block": {
                                "type": "BlockStatement",
                                "body": [
                                    actualExpression
                                ]
                            },
                            "guardedHandlers": [],
                            "handlers": [
                                {
                                    "type": "CatchClause",
                                    "param": {
                                        "type": "Identifier",
                                        "name": "error"
                                    },
                                    "body": {
                                        "type": "BlockStatement",
                                        "body": [
                                            {
                                                "type": "ExpressionStatement",
                                                "expression": {
                                                    "type": "AssignmentExpression",
                                                    "operator": "=",
                                                    "left": {
                                                        "type": "Identifier",
                                                        "name": "result"
                                                    },
                                                    "right": {
                                                        "type": "Literal",
                                                        "value": true,
                                                        "raw": "true"
                                                    }
                                                }
                                            },
                                            {
                                                "type": "ExpressionStatement",
                                                "expression": {
                                                    "type": "AssignmentExpression",
                                                    "operator": "=",
                                                    "left": {
                                                        "type": "Identifier",
                                                        "name": "localError"
                                                    },
                                                    "right": {
                                                        "type": "Identifier",
                                                        "name": "error"
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                }
                            ],
                            "finalizer": null
                        },
                        {
                            "type": "IfStatement",
                            "test": {
                                "type": "UnaryExpression",
                                "operator": "!",
                                "argument": {
                                    "type": "Identifier",
                                    "name": "result"
                                },
                                "prefix": true
                            },
                            "consequent": {
                                "type": "BlockStatement",
                                "body": [
                                    {
                                        "type": "VariableDeclaration",
                                        "declarations": [
                                            {
                                                "type": "VariableDeclarator",
                                                "id": {
                                                    "type": "Identifier",
                                                    "name": "newError"
                                                },
                                                "init": {
                                                    "type": "NewExpression",
                                                    "callee": {
                                                        "type": "Identifier",
                                                        "name": "Error"
                                                    },
                                                    "arguments": [

                                                    ]
                                                }
                                            }
                                        ],
                                        "kind": "var"
                                    },
                                    {
                                        "type": "ExpressionStatement",
                                        "expression": {
                                            "type": "AssignmentExpression",
                                            "operator": "=",
                                            "left": {
                                                "type": "MemberExpression",
                                                "computed": false,
                                                "object": {
                                                    "type": "Identifier",
                                                    "name": "newError"
                                                },
                                                "property": {
                                                    "type": "Identifier",
                                                    "name": "name"
                                                }
                                            },
                                            "right": {
                                                "type": "Literal",
                                                "value": "AssertionError",
                                                "raw": "\"AssertionError\""
                                            }
                                        }
                                    },
                                    {
                                        "type": "ExpressionStatement",
                                        "expression": {
                                            "type": "AssignmentExpression",
                                            "operator": "=",
                                            "left": {
                                                "type": "MemberExpression",
                                                "computed": false,
                                                "object": {
                                                    "type": "Identifier",
                                                    "name": "newError"
                                                },
                                                "property": {
                                                    "type": "Identifier",
                                                    "name": "__doctest"
                                                }
                                            },
                                            "right": {
                                                "type": "Literal",
                                                "value": "DocTestError",
                                                "raw": "\"DocTestError\""
                                            }
                                        }
                                    },

                                    {
                                        "type": "ExpressionStatement",
                                        "expression": {
                                            "type": "AssignmentExpression",
                                            "operator": "=",
                                            "left": {
                                                "type": "MemberExpression",
                                                "computed": false,
                                                "object": {
                                                    "type": "Identifier",
                                                    "name": "newError"
                                                },
                                                "property": {
                                                    "type": "Identifier",
                                                    "name": "message"
                                                }
                                            },
                                            "right": {
                                                "type": "Literal",
                                                "value": actualCode + " is expected to be " + expectedCode + ".",
                                                "raw": "\"" + actualCode + " is expected to be " + expectedCode + ".\""
                                            }
                                        }
                                    },
                                    {
                                        "type": "ExpressionStatement",
                                        "expression": {
                                            "type": "AssignmentExpression",
                                            "operator": "=",
                                            "left": {
                                                "type": "MemberExpression",
                                                "computed": false,
                                                "object": {
                                                    "type": "Identifier",
                                                    "name": "newError"
                                                },
                                                "property": {
                                                    "type": "Identifier",
                                                    "name": "loc"
                                                }
                                            },
                                            "right": {
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
                                        }
                                    },
                                    {
                                        "type": "ThrowStatement",
                                        "argument": {
                                            "type": "Identifier",
                                            "name": "newError"
                                        }
                                    }
                                ]
                            },
                            "alternate": null
                        }
                    ]
                },
                "rest": null,
                "generator": false,
                "expression": false
            },
            "arguments": []
        }
    }
}


module.exports = exceptionGenerator;