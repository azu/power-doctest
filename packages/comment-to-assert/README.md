# comment-to-assert

Convert comment to `assert()` function.

```js
var foo = 1;
foo;// => 1
```

Convert this to:

```js
var foo = 1;
assert.equal(foo, 1);
```

## Installation

    npm install comment-to-assert
    
## Usage

### toAssertFromSource(source : string): string

Return string that transformed source string of arguments.

```js
import {
    toAssertFromSource,
    toAssertFromAST
} from "comment-to-assert"
toAssertFromSource("1;// => 1");// => "assert.equal(1, 1)"
```

### toAssertFromAST(AST : object): object

Return AST object that transformed AST of arguments.

```js
var AST = parse(`var a = [1];
                          a;// => [1]`);
var resultOfAST = toAssertFromAST(AST);
generate(resultOfAST);
/*
var a = [1];
assert.deepEqual(a, [1]);
*/
```

## Tests

    npm test

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT