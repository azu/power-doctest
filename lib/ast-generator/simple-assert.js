function assertGenerator(node, commentExpression) {
    return {
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
                    "right": commentExpression
                }
            ]
        }
    }
}


module.exports = assertGenerator;