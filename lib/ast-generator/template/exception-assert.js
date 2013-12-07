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
    var newError = new Error(error.message);
    newError.loc = __loc__
    throw newError;
})();
