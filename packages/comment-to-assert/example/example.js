// LICENSE : MIT
"use strict";
var assert = require("assert");
var toAssertFromSource = require("comment-to-assert").toAssertFromSource;
var resultOfPrimitive = toAssertFromSource("1;// => 1");
assert.equal(resultOfPrimitive, 'assert.equal(1, 1);');
var resultOfObject = toAssertFromSource("[1];// => [1]");
assert.equal(resultOfObject, 'assert.deepEqual([1], [1]);');
var resultOfIdentifier = toAssertFromSource("var foo=1;foo;// => 1");
assert.equal(resultOfPrimitive, 'assert.equal(foo, 1);');
