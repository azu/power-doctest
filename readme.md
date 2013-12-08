# power-doctest [![Build Status](https://travis-ci.org/azu/power-doctest.png?branch=master)](https://travis-ci.org/azu/power-doctest)

doctest + [power-assert](https://github.com/twada/power-assert "power-assert").

## Installation

``` sh
npm install -g power-doctest
```

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
total; // > 5
```

This code expect ``total`` to be ``5``.

Result :

``` sh
$ node bin/power-doctest.js example/item03.js
example/item03.js:8:0
AssertionError

        assert(total === 5);
               |     |
               15    false
```

![assert-test](http://gyazo.com/075b4afe13003bd8691a85b371f84afe.gif)

### Exception Test

Look like `=> Error` is `assert.throw()`.

``` js
throw new Error(); // => Error
obj.not.found;// => Error
```

![error-test](http://gyazo.com/0c2bbc62f796288e94ddb3344581eb63.gif)


[![image](http://img.youtube.com/vi/uvcdBLm93aA/0.jpg)](http://www.youtube.com/watch?v=uvcdBLm93aA)

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT