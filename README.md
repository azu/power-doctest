# power-doctest

A monorepo for power-doctest.

power-doctest is a project that provide doctest system for JavaScript.

## Packages

- [comment-to-assert](./packages/comment-to-assert)
    - `// => expression` to `assert`
- [power-doctest](./packages/power-doctest)
    - Convert code to doctest ready code
- [power-doctest-runner](./packages/power-doctest-runner)
    - Run doctest ready code

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
