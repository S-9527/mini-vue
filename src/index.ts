export * from './runtime-dom'
import { baseCompile } from "./compiler-core/src";
import * as runtimeDom from "./runtime-dom";
import { registerRuntimeCompiler } from "./runtime-dom";

function compileToFunction(template: string) {
    const { code } = baseCompile(template)
    return new Function("Vue", code)(runtimeDom)
}

registerRuntimeCompiler(compileToFunction)