# power-doctest

doctest + [power-assert](https://github.com/twada/power-assert "power-assert").

## Installation

``` sh
npm install -g power-doctest
```

## Usage

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
FAIL # at line: 13

assert(value === 5);
       |     |
       15    false
```

[![image](http://img.youtube.com/vi/uvcdBLm93aA/0.jpg)](http://www.youtube.com/watch?v=uvcdBLm93aA)

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT