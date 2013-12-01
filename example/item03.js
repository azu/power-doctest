/**
 * Created by azu on 2013/11/17.
 */

function sum(ary) {
    return ary.reduce(function (current, next) {
        return current + next
    }, 0);
}

var value = {a: 1};
var b = {b: 1};
value; // > b
