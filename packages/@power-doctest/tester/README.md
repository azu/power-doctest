# @power-doctest/javascript

A Test Runner for A power-doctest.

## Install

Install with [npm](https://www.npmjs.com/):

    npm install @power-doctest/javascript

## Usage

```js
import { run } from "@power-doctest/javascript"
run(`
console.log(1); // => 1
console.log("string"); // => "string"
console.log([1, 2, 3]); // => [1, 2, 3]
console.log({ key: "value" }); // => { key: "value" }
console.log(NaN); // => NaN
console.log(null); // => null
// Special Case
throw new Error("message"); // => Error: "message"
// Promise
Promise.resolve(1); // => Resolve: 1
Promise.reject(new Error("message")); // => Reject: "message"
`).then(() => {
    console.log("Pass");
}).catch(error => {
    console.log("failed");
})
```

## Changelog

See [Releases page](https://github.com/azu/power-doctest-runner/releases).

## Running tests

Install devDependencies and Run `npm test`:

    npm test

## Contributing

Pull requests and stars are always welcome.

For bugs and feature requests, [please create an issue](https://github.com/azu/power-doctest-runner/issues).

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
