function assertGenerator(node, commentExpression) {
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
                    "name": "ok"
                }
            },
            "arguments": [
                {
                    "type": "BinaryExpression",
                    "operator": "===",
                    "left": node.expression,
                    "right": commentExpression
                }
            ]
        }
    }
}


module.exports = assertGenerator;