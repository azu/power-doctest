# power-doctest [![Build Status](https://travis-ci.org/azu/power-doctest.png?branch=master)](https://travis-ci.org/azu/power-doctest)

Doctest + [power-assert](https://github.com/twada/power-assert "power-assert").

## Installation

``` sh
npm install -g power-doctest
```

### Task

* [azu/gulp-power-doctest](https://github.com/azu/gulp-power-doctest "azu/gulp-power-doctest")

## Usage


power-doctest convert following code

``` js
function sum(ary) {
    return ary.reduce(function (current, next) {
        return current + next
    }, 0);
}

var total = sum([1, 2, 3, 4, 5]);
total; // => 5
```

to

``` js
var assert = require('power-assert');
function sum(ary) {
    return ary.reduce(function (current, next) {
        return current + next;
    }, 0);
}
var total = sum([
    1,
    2,
    3,
    4,
    5
]);
assert.equal(assert._expr(assert._capt(total, 'arguments/0'), {
    content: 'assert.equal(total, 5)',
    line: 14
}), 5);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsInNvdXJjZXNDb250ZW50IjpbXX0
```

And execute this transformed code:

```sh
$ node example/transformed.js
AssertionError:   # at line: 14

  assert.equal(total, 5)
               |
               15

```

![assert-test](http://gyazo.com/075b4afe13003bd8691a85b371f84afe.gif)

### Syntax

| Syntax                                            | Transformed                                                  |
| ------------------------------------------------- | ------------------------------------------------------------ |
| `1; // => 2`                                      | `assert.strictEqual(1, 2)`                                   |
| `console.log(1); // => 2`                         | `assert.strictEqual(1, 2)`                                   |
| `a; // => b`                                      | `assert.deepStrictEqual(a, b)`                                   |
| `[1, 2, 3]; // => [3, 4, 5]`                      | `assert.deepStrictEqual([1, 2, 3], [3, 4, 5])`               |
| `console.log({ a: 1 }): //=> { b: 2 }`            | `assert.deepStrictEqual({ a: 1 }, { b: 2 })`                 |
| `throw new Error("message"); // Error: "message"` | `assert.throws(function() {throw new Error("message"); });"` |
| `Promise.resolve(1); // Resolve: 2`               | `Promise.resolve(Promise.resolve(1)).then(v => { assert.strictEqual(1, 2) }) ` |
| `Promise.reject(1); // Reject: 2`                 | `assert.rejects(Promise.reject(1))`                          |

For more details, see [comment-to-assert](https://www.npmjs.com/package/comment-to-assert).

### Exception Test

Look like `=> Error` is `assert.throw()`.

``` js
throw new Error(); // => Error
var object = {};
obj.not.found;// => Error
```

Covert this case to:

```js
var assert = require('power-assert');
assert.throws(function () {
    throw new Error();
}, Error);
var object = {};
assert.throws(function () {
    object.not.found;
}, Error);
```

## UseCase

It will be useful for writing document or book.
Example code should be tested, but it is difficult.
power-doctest help to introduce automatic testing for example code.

- [markdown-doc-test.js](https://github.com/asciidwango/js-primer/blob/b41fa8c8e93714570195934f9beb77557a636647/test/markdown-doc-test.js "markdown-doc-test.js")

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT
