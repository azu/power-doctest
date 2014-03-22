(function () {
    var actual = __actual__;
    var expected = ___expect___;
    try {
        if (typeof actual === "object" || typeof expected === "object") {
            assert.deepEqual(actual, expected);
        } else {
            assert(actual === expected);
        }
    } catch (error) {
        var newError = error;
        newError.loc = ___loc___;
        throw newError;
    }
})();