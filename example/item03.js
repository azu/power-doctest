/**
 * Created by azu on 2013/11/17.
 */

function sum(ary) {
    return ary.reduce(function (current, next) {
        return current + next
    }, 0);
}

var total = sum([1, 2, 3, 4, 5]);
total; // > 5

var value = {a: 1};
var b = {b: 1};
value; // > b
