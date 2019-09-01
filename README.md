# power-doctest [![Build Status](https://travis-ci.org/azu/power-doctest.svg?branch=master)](https://travis-ci.org/azu/power-doctest)

A monorepo for power-doctest.

power-doctest is a project that provide doctest system for JavaScript.

## Packages

- [comment-to-assert](./packages/comment-to-assert)
    - `// => expression` to `assert`
- [power-doctest](./packages/power-doctest)
    - Convert code to doctest-ready code
- [@power-doctest/cli](./packages/@power-doctest/cli)
    - A command line tool for power-doctest
- [@power-doctest/tester](./packages/@power-doctest/tester)
    - A Test Runner for A power-doctest.
- [@power-doctest/jacvascript](./packages/@power-doctest/javascript)
    - A JavaScript parser for power-doctest.
- [@power-doctest/markdown](./packages/@power-doctest/markdown)
    - A Markdown parser for power-doctest.
- [@power-doctest/asciidoctor](./packages/@power-doctest/asciidoctor)
    - A Asciidoctor parser for power-doctest.


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
