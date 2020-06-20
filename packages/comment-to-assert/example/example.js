// LICENSE : MIT
"use strict";
var assert = require("assert");
var toAssertFromSource = require("comment-to-assert").toAssertFromSource;
toAssertFromSource("1;// => 1"); // => 'assert.equal(1, 1);'
toAssertFromSource("[1];// => [1]"); // => 'assert.deepEqual([1], [1]);'
toAssertFromSource("var foo=1;foo;// => 1"); // => 'var foo = 1;\nassert.equal(foo, 1);'
