var assert = require("power-assert");

assert.throws(function () {
  throw new Error("message");
}); // => Error: "message"