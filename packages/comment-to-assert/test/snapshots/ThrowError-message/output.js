assert.throws(function () {
  throw new Error("x is not defined");
}); // => ReferenceError: x is not defined