# power-doctest [![Build Status](https://travis-ci.org/azu/power-doctest.png?branch=master)](https://travis-ci.org/azu/power-doctest)

Doctest + [power-assert](https://github.com/twada/power-assert "power-assert").

## Installation

``` sh
npm install -g power-doctest
```

### Task

* [azu/gulp-power-doctest](https://github.com/azu/gulp-power-doctest "azu/gulp-power-doctest")

## Usage

    Usage: power-doctest [options] /path/to/file.js

    Options:
      -h, --help    Display help and usage details.
      -o, --output  Output Path


Test code :

``` js
function sum(ary) {
    return ary.reduce(function (current, next) {
        return current + next
    }, 0);
}

var total = sum([1, 2, 3, 4, 5]);
total; // => 5
```

This code expect ``total`` to be ``5``.

Result :

``` sh
$ power-doctest example/example.js
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
$ power-doctest example/example.js | node -p
AssertionError:   # at line: 14

  assert.equal(total, 5)
               |
               15

```

![assert-test](http://gyazo.com/075b4afe13003bd8691a85b371f84afe.gif)

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

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT
