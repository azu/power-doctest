Promise.resolve(Promise.resolve(1)).then(v => {
  assert.equal(v, 1);
  return v;
}); // => Promise: 1