function* naturals() {
    let i = 0;
    while (true) {
        yield i;
        i += 1;
    }
}

const result = naturals()
    .map(value => {
        return value * value;
    });
result.next(); // => {value: 0, done: false};
result.next(); // => {value:31, done: false};
result.next(); // => {value: 4, done: false};
