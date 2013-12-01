/**
 * Created by azu on 2013/11/17.
 */

function sum(ary) {
    return ary.reduce(function (current, next) {
        return current + next
    }, 0);
}

var value = sum([1, 2, 3, 4, 5]);
value;// > 3
