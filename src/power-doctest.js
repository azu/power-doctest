// LICENSE : MIT
"use strict";
import {toAssertFromAST} from "comment-to-assert"
import {injectAssertModule} from "./inject-assert"
import empower from "empower"
import assert from "assert"
import ASTSource from "ast-source"
export function convertCode(code, filePath) {
    var source = new ASTSource(code, {
        filePath: filePath,
        disableSourceMap: typeof filePath === "undefined"
    });
    var output = source.transform(convertAST).output();
    return output.codeWithMap;
}

export function convertAST(AST) {
    var empowerOptions = {modifyMessageOnRethrow: true, saveContextOnRethrow: true};
    var boundEspower = (AST) => {
        return empower(AST, empowerOptions);
    };
    var modifyMapFunctionList = [toAssertFromAST, injectAssertModule, boundEspower];
    return modifyMapFunctionList.reduce((AST, modify, index) => {
        var result = modify(AST);
        assert(result != null, modifyMapFunctionList[index].name + " return wrong result. result: " + result);
        return result;
    }, AST);
}