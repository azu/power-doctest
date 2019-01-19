// LICENSE : MIT
"use strict";
import { parse } from "@babel/parser";
import { File } from "@babel/types";
import { transformFromAst } from "@babel/core";
import generate from "@babel/generator";
import assert from "assert"
import { toAssertFromAST } from "comment-to-assert"
import { injectAssertModule } from "./inject-assert"

export function convertCode(code: string): string {
    const AST = parse(code, {
        sourceType: "module"
    });
    const output = convertAST(AST);
    return generate(output, {
        comments: true
    }).code;
}

export function convertAST<T extends File>(AST: T): T {
    const boundEspower = (AST: T) => {
        const transformed = (transformFromAst as any)(AST, {
            plugins: ['babel-plugin-espower']
        });
        if (!transformed || !transformed.code) {
            throw new Error("Can not transform espower");
        }
        return parse(transformed.code, {
            sourceType: "module"
        });
    };
    const modifyMapFunctionList: ((ast: any) => any)[] = [toAssertFromAST, injectAssertModule, boundEspower];
    return modifyMapFunctionList.reduce((AST, modify, index) => {
        const result = modify(AST);
        assert(result != null, modifyMapFunctionList[index].name + " return wrong result. result: " + result);
        return result;
    }, AST as T);
}
