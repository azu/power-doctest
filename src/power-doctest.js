// LICENSE : MIT
"use strict";
import {toAssertFromAST} from "comment-to-assert"
import {injectAssertModule} from "./inject-assert"
import espower from "espower"
import assert from "assert"
import ASTSource from "ast-source";
import {ASTDataContainer, ParserTypes} from "ast-source"
export function convertCode(code, filePath) {
    var source = new ASTSource(code, {
        filePath: filePath,
        disableSourceMap: typeof filePath === "undefined"
    });
    var transform = source.transform(convertAST);
    var output = transform.output();
    return output.codeWithMap;
}

export function convertAST(AST) {
    var empowerOptions = {
        destructive: false,
        modifyMessageOnRethrow: false,
        saveContextOnRethrow: false,
        patterns: [
            'assert(value, [message])',
            'assert.ok(value, [message])',
            'assert.equal(actual, expected, [message])',
            'assert.notEqual(actual, expected, [message])',
            'assert.strictEqual(actual, expected, [message])',
            'assert.notStrictEqual(actual, expected, [message])',
            'assert.deepEqual(actual, expected, [message])',
            'assert.notDeepEqual(actual, expected, [message])',
            'assert.deepStrictEqual(actual, expected, [message])',
            'assert.notDeepStrictEqual(actual, expected, [message])'
        ]
    };
    var boundEspower = (AST) => {
        var source = new ASTDataContainer(AST);
        var options = {
            loc: true,
            range: true,
            parserType: ParserTypes.Esprima
        };
        source.transformStrict(AST => {
            return espower(AST);
        }, options);
        return source.value;
    };
    var modifyMapFunctionList = [toAssertFromAST, injectAssertModule, boundEspower];
    return modifyMapFunctionList.reduce((AST, modify, index) => {
        var result = modify(AST);
        assert(result != null, modifyMapFunctionList[index].name + " return wrong result. result: " + result);
        return result;
    }, AST);
}