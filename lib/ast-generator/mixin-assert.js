var esprima = require("esprima");
var escodegen = require("escodegen");
var fs = require("fs");
var clone = require("clone");

function mixinGenerator(node, commentExpression) {
    var loc = clone(node.loc);
    var actualExpression = clone(node.expression);
    var expectedExpression = clone(commentExpression);
    return  {
        "type": "TryStatement",
        "block": {
            "type": "BlockStatement",
            "body": [
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
                    "type": "IfStatement",
                    "test": {
                        "type": "LogicalExpression",
                        "operator": "&&",
                        "left": {
                            "type": "BinaryExpression",
                            "operator": "===",
                            "left": {
                                "type": "UnaryExpression",
                                "operator": "typeof",
                                "argument": actualExpression,
                                "prefix": true
                            },
                            "right": {
                                "type": "Literal",
                                "value": "object",
                                "raw": "\"object\""
                            }
                        },
                        "right": {
                            "type": "BinaryExpression",
                            "operator": "===",
                            "left": {
                                "type": "UnaryExpression",
                                "operator": "typeof",
                                "argument": { // expected
                                    "type": "Identifier",
                                    "name": "expected"
                                },
                                "prefix": true
                            },
                            "right": {
                                "type": "Literal",
                                "value": "object",
                                "raw": "\"object\""
                            }
                        }
                    },
                    "consequent": {
                        "type": "BlockStatement",
                        "body": [
                            {
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
                                        actualExpression,
                                        {
                                            "type": "Identifier",
                                            "name": "expected"
                                        }
                                    ]
                                }
                            }
                        ]
                    },
                    "alternate": {
                        "type": "BlockStatement",
                        "body": [
                            {
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
                                            "left": actualExpression,
                                            "right": commentExpression
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
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
                            "type": "VariableDeclaration",
                            "declarations": [
                                {
                                    "type": "VariableDeclarator",
                                    "id": {
                                        "type": "Identifier",
                                        "name": "newError"
                                    },
                                    "init": {
                                        "type": "Identifier",
                                        "name": "error"
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
                }
            }
        ],
        "finalizer": null
    }
}


module.exports = mixinGenerator;