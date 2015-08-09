function sum(ary) {
    return ary.reduce(function (current, next) {
        return current + next
    }, 0);
}

var total = sum([1, 2, 3, 4, 5]);
total; // => 5
