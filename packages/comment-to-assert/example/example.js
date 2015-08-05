// LICENSE : MIT
"use strict";
var assert = require("assert");
var toAssert = require("comment-to-assert");
var resultOfPrimitive = toAssert.commentToAssertFromCode("1;// => 1");
assert.equal(resultOfPrimitive, 'assert.equal(1, 1);');
var resultOfObject = toAssert.commentToAssertFromCode("[1];// => [1]");
assert.equal(resultOfPrimitive, 'assert.deepEqual([1], [1]);');
var resultOfIdentifier = toAssert.commentToAssertFromCode("var foo=1;foo;// => 1");
assert.equal(resultOfPrimitive, 'assert.equal(foo, 1);');
