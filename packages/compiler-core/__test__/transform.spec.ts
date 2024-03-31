import { describe, expect, it } from "vitest";
import { baseParse } from "../src/parse";
import { transform } from "../src/transform";
import { NodeTypes } from "../src/ast";

describe("transform", () => {
    it("happy path", () => {
        const ast = baseParse("<div>hi,{{message}}</div>")

        const plugins = (node: any) => {
            if (node.type === NodeTypes.TEXT) {
                node.content = "hi,mini-vue"
            }
        }

        transform(ast, {
            nodeTransforms: [plugins]
        })

        const nodeText = ast.children[0].children[0]

        expect(nodeText.content).toBe("hi,mini-vue")
    })
})