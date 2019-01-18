Promise.resolve(Promise.resolve(1)).then(v => {
  assert.strictEqual(v, 1);
  done(null, v);
  return v;
}).catch(error => {
  done(error);
}); // => Promise: 1