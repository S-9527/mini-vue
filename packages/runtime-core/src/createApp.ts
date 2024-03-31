import { createVNode } from "./vnode";

export function createAppAPI(render: any){
    return function createApp(rootComponent: any) {
        return {
            mount(rootContainer: any) {
                const vNode = createVNode(rootComponent)
                render(vNode, rootContainer)
            }
        }
    }
}