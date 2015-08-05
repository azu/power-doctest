// LICENSE : MIT
"use strict";
export default class ParserGenerator {
    constructor(parser, generator) {
        this.parser = parser;
        this.generator = generator;
    }
}
let instance = new ParserGenerator();
export function getDefaultParserGenerator() {
    return instance;
}
export function setDefaultParserGenerator(pg) {
    instance = pg;
}