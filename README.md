# power-doctest

A monorepo for power-doctest.

power-doctest is a project that provide doctest system for JavaScript.

## Packages

- [comment-to-assert](./packages/comment-to-assert)
    - `// => expression` to `assert`
- [power-doctest](./packages/power-doctest)
    - Convert code to doctest-ready code
- [@power-doctest/jacvascript](./packages/@power-doctest/javascript)
    - Run JavaScript code as doctest
- [@power-doctest/markdown](./packages/@power-doctest/markdown)
    - Run markdown code block as doctest

## Development

Require [Yarn](https://yarnpkg.com/)

Install project

    yarn install
    yarn boostrap

Build

    yarn run build

Test

    yarn test
    
Release

    yarn run versionup
    # GH_TOKEN="${GITHUB_TOKEN}" yarn run versionup:patch --create-release=github
    # prepare release note
    yarn relase
