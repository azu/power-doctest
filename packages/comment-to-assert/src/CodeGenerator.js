// LICENSE : MIT
"use strict";
import escodegen from "escodegen"
export var defaultOptions = {
    comment: true
};
export default class CodeGenerator {
    constructor(generator = escodegen, options = {}) {
        if (typeof generator.generate === "undefined") {
            throw new Error("generator must has #generate");
        }
        this.generator = generator;
        this.options = options;
    }

    generate(AST) {
        return generator.generate(AST, this.options);
    }
}