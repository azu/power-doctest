// LICENSE : MIT
"use strict";
import { toAssertFromAST } from "comment-to-assert"
import { injectAssertModule } from "./inject-assert"
import espower from "espower"
import assert from "assert"
import ASTSource from "ast-source";
import { ASTDataContainer, ParserTypes } from "ast-source"
export function convertCode(code, filePath) {
    const source = new ASTSource(code, {
        filePath: filePath,
        disableSourceMap: typeof filePath === "undefined"
    });
    const transform = source.transform(convertAST);
    const output = transform.output();
    return output.codeWithMap;
}

export function convertAST(AST) {
    const boundEspower = (AST) => {
        const source = new ASTDataContainer(AST);
        const options = {
            loc: true,
            range: true,
            parserType: ParserTypes.Esprima
        };
        source.transformStrict(AST => {
            return espower(AST);
        }, options);
        return source.value;
    };
    const modifyMapFunctionList = [toAssertFromAST, injectAssertModule, boundEspower];
    return modifyMapFunctionList.reduce((AST, modify, index) => {
        const result = modify(AST);
        assert(result != null, modifyMapFunctionList[index].name + " return wrong result. result: " + result);
        return result;
    }, AST);
}