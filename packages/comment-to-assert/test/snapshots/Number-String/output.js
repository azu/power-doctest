assert.strictEqual(0b0000000000000000000000000001001, 9); // => 9
// Number#toStringメソッドを使うことで2進数表記の文字列を取得できる
assert.strictEqual((9).toString(2), "1001"); // => "1001"
