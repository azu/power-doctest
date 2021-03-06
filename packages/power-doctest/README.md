# power-doctest

A command line tool for power-doctest.

## Install

Install with [npm](https://www.npmjs.com/):

    npm install power-doctest -g

## Usage

### CLI

	Usage
	  $ power-doctest /path/to/file.{js,md,adoc}

	Options
	  --packageDir  Current Working directory. Should put package.json in the directory.
	  --disableRunning Disable running test case that has not state.

	Examples
	  $ power-doctest ./README.md
	  $ power-doctest ./README.adoc
	  $ power-doctest ./src/main.js

### Node Modules

```js
const { runPowerDoctest } = require("power-doctest");
runPowerDoctest({
    content: "1; // => 2",
    contentType: "javascript",
    filePath: "test.js",
    disableRunning: false
}).then(results => {
    console.log(results[0].status); // => "rejected"
});
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
