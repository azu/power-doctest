const array = ["A", "B", "C"];
array.unshift("S"); // "S"を先頭に追加
assert.deepStrictEqual(array, ["S", "A", "B", "C"]); // => ["S", "A", "B", "C"]
const shiftedItem = array.shift(); // 先頭の要素を削除
assert.strictEqual(shiftedItem, "S"); // => "S"
assert.deepStrictEqual(array, ["A", "B", "C"]); // => ["A", "B", "C"]
