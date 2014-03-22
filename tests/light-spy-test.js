/**
 * Created by azu on 2014/03/22.
 * LICENSE : MIT
 */
"use strict";
var assert = require('chai').assert;
var lightSpy = require("../lib/light-spy").lightSpy;
describe("lightSpy", function () {
    function someThing(echo) {
        return echo;
    }

    var obj = {
        name: "name",
        someThing: function () {
            return this.name;
        }
    };
    it("spy `someThing()`", function () {
        var message = "test";
        var callback = function (args) {
            assert.equal(args[0], message);
        };
        var spy = lightSpy(someThing, callback);
        var results = spy(message);
        assert.equal(results, message);
    });
    it("spy preserve `this`", function () {
        var callback = function (args) {
        };
        var spy = lightSpy(obj.someThing.bind(obj), callback);
        var results = spy();
        assert.equal(results, obj.name);
    });
});