import * as monaco from 'monaco-editor';
import * as prettier from 'prettier/standalone';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

import babel from "prettier/plugins/babel";
import estree from 'prettier/plugins/estree';

import theme from "./theme.js";
import { baseCompile, effect } from "../vue/dist/mini-vue.esm-bundler.js";

self.MonacoEnvironment = {
    getWorker(_, label) {
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
            return new HtmlWorker();
        }
        if (label === 'typescript' || label === 'javascript') {
            return new TsWorker();
        }
        return new EditorWorker();
    },
}

const rootContainer = document.querySelector("#container");
const outputContainer = document.querySelector("#output");

monaco.editor.defineTheme("theme", theme)
monaco.editor.setTheme("theme");

const sharedEditorOptions = {
    fontSize: 14,
    scrollBeyondLastLine: false,
    renderWhitespace: 'selection',
    minimap: {
        enabled: false,
    },
};

let lastSuccessfulCode;
const editor = monaco.editor.create(rootContainer, {
    value: `<div>Hello World!</div>`,
    language: 'html',
    ...sharedEditorOptions,
});

const output = monaco.editor.create(outputContainer, {
    value: baseCompile(editor.getValue()).code,
    language: 'javascript',
    ...sharedEditorOptions,
})


editor.getModel().updateOptions({
    tabSize: 20,
});

output.getModel().updateOptions({
    tabSize: 2,
});

// handle resize
window.addEventListener('resize', () => {
    editor.layout();
    output.layout();
});

// highlight output code
editor.onDidChangeModelContent(debounce(reCompile));

function debounce(fn, delay = 300) {
    let prevTimer = null;
    return (...args) => {
        if (prevTimer) {
            clearTimeout(prevTimer);
        }
        prevTimer = window.setTimeout(() => {
            fn(...args);
            prevTimer = null;
        }, delay);
    };
}

const prettierConfig = {
    parser: 'babel',
    plugins: [babel, estree],
};

const compileFn = (source) => {
    const { code } = baseCompile(source)
    prettier.format(code, prettierConfig).then(formatted => output.setValue(formatted))
    return code
};

function compileCode(source) {
    console.clear();
    try {
        const start = performance.now();
        const code = compileFn(source);
        console.log(`Compiled in ${(performance.now() - start).toFixed(2)}ms.`);
        lastSuccessfulCode = code;
    } catch (e) {
        lastSuccessfulCode = `/* ERROR: ${e.message} (see console for more info) */`;
        console.error(e);
    }
    return lastSuccessfulCode;
}

function reCompile() {
    const res = compileCode(editor.getValue());
    if (!res) return;

    output.setValue(res);
    output.trigger('editor', 'editor.action.formatDocument', undefined);
}

effect(() => reCompile);