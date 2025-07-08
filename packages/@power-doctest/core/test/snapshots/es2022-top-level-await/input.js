console.log(await 1); // => 1
console.log(await new Promise((resolve) => resolve(2))); // => 2
