export * from '@mini-vue/runtime-dom';
import { baseCompile } from "@mini-vue/compiler-core";
import * as runtimeDom from "@mini-vue/runtime-dom";
import { registerRuntimeCompiler } from "@mini-vue/runtime-dom";

function compileToFunction(template: any) {
    const { code } = baseCompile(template)
    return new Function("Vue", code)(runtimeDom)
}

registerRuntimeCompiler(compileToFunction)