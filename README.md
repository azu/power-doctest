# power-doctest [![Build Status](https://travis-ci.org/azu/power-doctest.svg?branch=master)](https://travis-ci.org/azu/power-doctest)

A monorepo for power-doctest.

power-doctest is a project that provide doctest system for JavaScript.

## Packages

- [comment-to-assert](./packages/comment-to-assert)
    - `// => expression` to `assert`
- [power-doctest](./packages/power-doctest)
    - A command line tool for power-doctest
    - Convert code and Run the code as doctest
- [@power-doctest/core](packages/@power-doctest/core)
    - Convert code to doctest-ready code
- [@power-doctest/tester](./packages/@power-doctest/tester)
    - A Test Runner for A power-doctest.
- [@power-doctest/javascript](./packages/@power-doctest/javascript)
    - A JavaScript parser for power-doctest.
- [@power-doctest/markdown](./packages/@power-doctest/markdown)
    - A Markdown parser for power-doctest.
- [@power-doctest/asciidoctor](./packages/@power-doctest/asciidoctor)
    - A Asciidoctor parser for power-doctest.

## Recipes

### Doctest JavaScript Code

Use [@power-doctest/tester](./packages/@power-doctest/tester) and [@power-doctest/javascript](./packages/@power-doctest/javascript) in [Mocha](https://mochajs.org/).

```js
import { test } from "@power-doctest/tester";
import { parse } from "@power-doctest/javascript";
const globby = require("globby");
const fs = require("fs");
const path = require("path");
// doctest for source/**/*.js
describe("doctest:js", function() {
    const sourceDir = path.join(__dirname, "..", "source");
    const files = globby.sync([
        `${sourceDir}/**/*.js`,
        `!${sourceDir}/**/node_modules{,/**}`
    ]);
    files.forEach(filePath => {
        const normalizeFilePath = filePath.replace(sourceDir, "");
        it(`doctest:js ${normalizeFilePath}`, function() {
            const content = fs.readFileSync(filePath, "utf-8");
            const parsedResults = parse({
                content,
                filePath
            });
            const parsedCode = parsedResults[0];
            return test(parsedCode).catch(error => {
                // Stack Trace like
                console.error(`StrictEvalError: strict eval is failed
    at strictEval (${filePath}:1:1)`);
                return Promise.reject(error);
            });
        });
    });
});
```

**Example**

- <https://github.com/asciidwango/js-primer/blob/master/test/example-test.js>

### Doctest JavaScript Code in Markdown

Use [@power-doctest/tester](./packages/@power-doctest/tester) and [@power-doctest/markdown](./packages/@power-doctest/markdown) in [Mocha](https://mochajs.org/).

```js
import { test } from "@power-doctest/tester";
import { parse } from "@power-doctest/markdown";
const globby = require("globby");
const fs = require("fs");
const path = require("path");
const transform = (code) => {
    return code; // you need pre transform for the code if needed.
};
// doctest for source/**/*.md
describe("doctest:md", function() {
    const sourceDir = path.join(__dirname, "..", "source");
    const files = globby.sync([
        `${sourceDir}/**/*.md`,
        `!${sourceDir}/**/node_modules{,/**}`,
    ]);
    files.forEach(filePath => {
        const normalizeFilePath = filePath.replace(sourceDir, "");
        describe(`${normalizeFilePath}`, function() {
            const content = fs.readFileSync(filePath, "utf-8");
            const parsedCodes = parse({
                filePath,
                content
            });
            // try to eval
            const dirName = path.dirname(filePath).split(path.sep).pop();
            parsedCodes.forEach((parsedCode, index) => {
                const codeValue = parsedCode.code;
                const testCaseName = codeValue.slice(0, 32).replace(/[\r\n]/g, "_");
                it(dirName + ": " + testCaseName, function() {
                    return test({
                        ...parsedCode,
                        code: transform(parsedCode.code)
                    }, {
                        defaultDoctestRunnerOptions: {
                            // Default timeout: 2sec
                            timeout: 1000 * 2
                        }
                    }).catch(error => {
                        const filePathLineColumn = `${error.fileName}:${error.lineNumber}:${error.columnNumber}`;
                        console.error(`Markdown Doctest is failed
  at ${filePathLineColumn}

----------
${codeValue}
----------
`);
                        return Promise.reject(error);
                    });
                });
            });
        });
    });
});
```

**Example**

- <https://github.com/asciidwango/js-primer/blob/master/test/markdown-doc-test.js>

### Doctest JavaScript in Asciidoctor

Use [@power-doctest/tester](./packages/@power-doctest/tester) and [@power-doctest/asciidoctor](./packages/@power-doctest/asciidoctor) in [Mocha](https://mochajs.org/).

```js
const { test } = require("@power-doctest/tester");
const { parse } = require("@power-doctest/asciidoctor");
const globby = require("globby");
const fs = require("fs");
const path = require("path");
// Avoid "do not support nested sections" Error
// Replace Header with Dummy text
const replaceDummyHeader = (content) => {
    return content.split("\n").map(line => {
        return line.replace(/^(=+)/g, (all, match) => {
            return "♪".repeat(match.length);
        });
    }).join("\n");
};
// doctest for source/**/*.adoc
describe("doctest:adoc", function () {
    const sourceDir = path.join(__dirname, "..", "source");
    const files = globby.sync([
        `${sourceDir}/**/*.adoc`,
        `!**/node_modules{,/**}`,
    ]);
    files.forEach(filePath => {
        const normalizeFilePath = filePath.replace(sourceDir, "");
        describe(`${normalizeFilePath}`, function () {
            const content = fs.readFileSync(filePath, "utf-8");
            const parsedCodes = parse({
                filePath,
                content: replaceDummyHeader(content)
            });
            console.log("parsedCodes", parsedCodes);
            // try to eval
            const dirName = path.dirname(filePath).split(path.sep).pop();
            parsedCodes.forEach((parsedCode, index) => {
                const codeValue = parsedCode.code;
                const testCaseName = codeValue.slice(0, 32).replace(/[\r\n]/g, "_");
                it(dirName + ": " + testCaseName, function () {
                    return test(parsedCode).catch(error => {
                        const filePathLineColumn = `${error.fileName}:${error.lineNumber}:${error.columnNumber}`;
                        console.error(`Asciidoc Doctest is failed
  at ${filePathLineColumn}

----------
${codeValue}
----------
`);
                        return Promise.reject(error);
                    });
                });
            });
        });
    });
});
```

**Example**

- <https://github.com/azu/promises-book/blob/7db237e6274a3af8db3b5cb92a2dd8574d9890e5/test/doctest.js>

## Development

Require [Yarn](https://yarnpkg.com/)
 
Install project

    yarn install
    yarn boostrap

Build

    yarn run build

Test

    yarn test
    
Release: use npm

    npm run versionup
    # GH_TOKEN="${GITHUB_TOKEN}" yarn run versionup:patch --create-release=github
    # prepare release note
    npm relase
