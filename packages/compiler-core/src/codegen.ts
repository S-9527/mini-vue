import { NodeTypes } from "./ast";
import { CREATE_ELEMENT_VNODE, helperNameMap, TO_DISPLAY_STRING } from "./runtimeHelpers";
import { isString } from "@mini-vue/shared";

export function generate(ast: any) {
    const context = createCodegenContext()
    const { push } = context

    genFunctionPreamble(ast, context)

    const functionName = "render"
    const args = ["_ctx", "_cache"]
    const signature = args.join(", ")

    push(`function ${functionName}(${signature}) {`)
    push("return ")

    genNode(ast.codegenNode, context)
    push("}")

    return { code: context.code }
}

function genFunctionPreamble(ast: any, context: any) {
    const { push } = context

    const VueBinding = "Vue"
    const aliasHelper = (s: any) => `${helperNameMap[s]}: _${helperNameMap[s]}`

    if (ast.helpers.length > 0) {
        push(`const { ${ast.helpers.map(aliasHelper).join(", ")} } = ${VueBinding}`)
    }

    push("\n")
    push("return ")
}

function createCodegenContext() {
    const context = {
        code: "",
        push(source: string) {
            context.code += source
        },
        helper(key: any) {
            return `_${helperNameMap[key]}`
        }
    }

    return context
}

function genNode(node: any, context: any) {
    switch (node.type) {
        case NodeTypes.TEXT:
            genText(node, context);
            break;
        case NodeTypes.INTERPOLATION:
            genInterpolation(node, context);
            break;
        case NodeTypes.SIMPLE_EXPRESSION:
            genExpression(node, context);
            break;
        case NodeTypes.ELEMENT:
            genElement(node, context);
            break;
        case NodeTypes.COMPOUND_EXPRESSION:
            genCompoundExpression(node, context);
            break;
        default:
            break;
    }
}

function genCompoundExpression(node: any, context: any) {
    const { push } = context
    const { children } = node
    for (let i = 0; i < children.length; i++) {
        const child = children[i]
        if (isString(child)) {
            push(child)
        } else {
            genNode(child, context)
        }
    }
}

function genElement(node: any, context: any) {
    const { push, helper } = context
    const { props, tag, children } = node

    push(`${helper(CREATE_ELEMENT_VNODE)}(`)
    genNodeList(genNullable([tag, props, children]), context)
    push(`)`)
}

function genNodeList(nodes: any, context: any) {
    const { push } = context

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        if (isString(node)){
            push(node)
        } else {
            genNode(node, context)
        }

        if (i < nodes.length - 1) {
            push(", ")
        }
    }
}

function genNullable(args: any) {
    return args.map((arg: any) => arg || "null")
}

function genExpression(node: any, context: any) {
    const { push } = context
    push(`${node.content}`)
}

function genInterpolation(node: any, context: any) {
    const { push, helper } = context
    push(`${helper(TO_DISPLAY_STRING)}(`)

    genNode(node.content, context)
    push(`)`)
}

function genText(node: any, context: any) {
    const { push } = context
    push(`'${node.content}'`)
}