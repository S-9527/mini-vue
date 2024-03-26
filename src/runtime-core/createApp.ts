import { createVNode } from "./vnode";
import { render } from "./render";

export function createApp(rootComponent: any) {
    return {
        mount(rootContainer: any) {
            const vNode = createVNode(rootComponent)
            render(vNode, rootContainer)
        }
    }
}