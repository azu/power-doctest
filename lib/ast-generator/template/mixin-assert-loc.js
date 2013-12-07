try {
    if (typeof ___actual___ === "object" && typeof ___expect___ === "object") {
        assert.deepEqual(___actual___, ___expect___);
    } else {
        assert(___actual___ === ___expect___);
    }
} catch (error) {
    var newError = new Error(error.message);
    newError.loc = ___loc___;
    throw newError;
}