Promise.resolve(Promise.resolve(1)).then(v => {
  assert.strictEqual(v, 1);
  return v;
}); // => Resolve: 1
