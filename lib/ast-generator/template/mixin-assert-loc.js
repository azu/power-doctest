(function () {
    var expected = ___expect___;
    try {
        if (typeof ___actual___ === "object" && typeof expected === "object") {
            assert.deepEqual(___actual___, expected);
        } else {
            assert(___actual___ === ___expect___);
        }
    } catch (error) {
        var newError = error;
        newError.loc = ___loc___;
        throw newError;
    }
})();