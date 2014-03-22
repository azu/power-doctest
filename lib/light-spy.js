/**
 * Created by azu on 2014/03/22.
 * LICENSE : MIT
 */
"use strict";
function lightSpy(fn, callback) {
    var _originFn = fn;
    return function () {
        callback(arguments);
        return _originFn.apply(this, arguments);
    };
}
module.exports.lightSpy = lightSpy;