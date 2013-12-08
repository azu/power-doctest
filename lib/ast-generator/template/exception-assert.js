(function () {
    var result = false;
    var localError;
    var expected = ___expect___;
    try {
        actual;
    } catch (error) {
        result = true;
        localError = error;
    }
    var newError = new Error();
    newError.message = "__actual__ is expected __expect__"
    newError.loc = __loc__
    throw newError;
})();
