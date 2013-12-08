var a = [1, 2, 3];
a; // => [1 ,2,3]


function sum(ary) {
    return ary.reduce(function (current, next) {
        return current + next
    }, 0);
}

sum([1, 2, 3, 4, 5]); // => 5