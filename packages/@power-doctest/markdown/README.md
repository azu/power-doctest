# @power-doctest/markdown

A Markdown parser for power-doctest.

## Features

Run doctest for Markdown's CodeBlock.

    This is markdown example.
    Following code is tested by power-doctest.    

    
    `js` or `javascript` CodeBlock
    
    ```js
    console.log(1); // => 1
    ```    


## Install

Install with [npm](https://www.npmjs.com/):

    npm install @power-doctest/markdown

## Usage

`fixtures/example.md`:

    This Is Markdown
    
    Valid JavaScript Example:
    
    ```js
    console.log("ok"); // => "ok"
    ```
    
    Invalid JavaScript Example
    
    ```js
    const array = [1, 2, 3];
    console.log(array); // => [1, 44, 3]
    ```

Example test code

```js
import fs from "fs";
import path from "path";
import assert from "assert";
import { run } from "@power-doctest/markdown";

describe("run markdown", function() {
    it("is example", () => {
        const markdown = fs.readFileSync(path.join(__dirname, "fixtures/example.md"), "utf-8");
        return run(markdown).then(() => {
            // pass
        }).catch(aggregatedError => {
            assert.strictEqual(aggregatedError.message, "Throw 1 error in 2 code blocks");
            assert.strictEqual(aggregatedError.errors.length, 1);
            const [error] = aggregatedError.errors;
            assert.strictEqual(error.message, `  # default.js:4
  
  assert.deepStrictEqual(array, [1, 44, 3])
                         |      |          
                         |      [1,44,3]   
                         [1,2,3]           
  `)

        });
    });
});
```


## Doctest Control Annotation

`@power-doctest/markdown` support Doctest Control Annotation as HTML comments.

### Disable Doctest: `<!-- doctest:disable -->`

Disable doctest for the codeblock.

    This code block is not evaluated.
    
    <!-- doctest:disable -->
    ```js
    console.log(true); // => "not eval"
    ```


### Expected error: `<!-- doctest:*Error -->` 

If the error is not match the result, throw error.

    <!-- doctest:SyntaxError -->
    ```js
    ++++++++;
    ```

### Doctest options:` <!-- doctest:options:{ ... } -->`

Pass `options` to `@power-doctest/markdown`.
The inline options is preferred constructor options.

    <!-- doctest:options:{ "runMode": "any" } -->
    ```js
    if (1 === 1) {
        console.log(1); // => 1
    } else{
        console.log(2); // => 2
    }
    ```

### Metadata: `<!-- doctest:meta:{ ... } -->`

It is useful for testing original behavior.

    Attach Metadata to error
     
    <!-- doctest:meta:{ "ECMAScript": 2020 } -->
    ```javascript
    typeof 123n; // => "bigint"
    ```

And `errors` include `meta` property

```json
{
    "message": "Throw 1 error in 1 code blocks",
    "errors": [
        {
            "meta": {
                "ECMAScript": 2020
            },
            "message": "Identifier directly after number (1:10)"
        }
    ]
}
```

## Changelog

See [Releases page](https://github.com/azu/power-doctest/releases).

## Running tests

Install devDependencies and Run `npm test`:

    npm test

## Contributing

Pull requests and stars are always welcome.

For bugs and feature requests, [please create an issue](https://github.com/azu/power-doctest/issues).

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Author

- [github/azu](https://github.com/azu)
- [twitter/azu_re](https://twitter.com/azu_re)

## License

MIT © azu
