function __doctest(actual, expect, loc) {
    try {
        if (typeof actual === "object" && typeof expect === "object") {
            assert.deepEqual(actual, expect);
        } else {
            assert(actual === expect);
        }
    } catch (error) {
        var newError = new Error(error.message);
        newError.loc = loc;
        throw newError;
    }
}
