/**
 * Created by azu on 2014/03/22.
 * LICENSE : MIT
 */
"use strict";
var estraverse = require("estraverse");
function isFunctionCall(node,functionName) {
    if (node.type !== estraverse.Syntax.ExpressionStatement) {
        return false;
    }
    if(node.expression.type !== estraverse.Syntax.CallExpression) {
        return false
    }
    var callee = node.expression.callee;
    if(callee.type === estraverse.Syntax.MemberExpression) {
        if(callee.object.name === functionName) {
            return true;
        }
    }
    return callee.name === functionName;
}
function countMethodCall(ast, functionName) {
    var count = 0;
    estraverse.traverse(ast, {
        enter: function (node) {
            if (isFunctionCall(node, functionName)) {
                count = count + 1;
            }
        }
    });
    return count;
}
module.exports.countMethodCall = countMethodCall;