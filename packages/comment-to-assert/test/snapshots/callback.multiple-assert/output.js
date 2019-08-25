beforeCallback("id:0");
assert.strictEqual(1, 1);
afterCallback("id:0");
// => 1
beforeCallback("id:1");
assert.strictEqual("str", "str");
afterCallback("id:1");
// => "str"
beforeCallback("id:2");
assert.deepStrictEqual([1, 2, 3], [1, 2, 3]);
afterCallback("id:2");
// => [1,2,3]
Promise.resolve(Promise.resolve(1)).then(v => {
  beforeCallback("id:3");
  assert.strictEqual(v, 1);
  afterCallback("id:3");
  return v;
}); // => Resolve: 1