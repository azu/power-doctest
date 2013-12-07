function deepEqualGenerator(node, commentExpression) {
    return {
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
    }
}


module.exports = deepEqualGenerator;