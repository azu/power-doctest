// LICENSE : MIT
"use strict";
import esprima from "esprima"
export var defaultOptions = {
    loc: true,
    range: true,
    comment: true,
    attachComment: true
};
export default class CodeParser {
    constructor(parser = esprima, options = defaultOptions) {
        this.parser = parser;
        this.options = options;
    }

    parse(code) {
        return this.parser.parse(code, this.options);
    }
}