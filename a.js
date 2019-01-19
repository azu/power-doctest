var assert = require("power-assert");
assert.strictEqual("文字列", "文字列"); // => "文字列"
assert.strictEqual("\u6587\u5b57\u5217", "文字列"); // => "文字列"
assert.strictEqual("𩸽"[0], "\uD867"); // => "\uD867"
