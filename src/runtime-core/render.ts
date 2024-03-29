import { createComponentInstance, setupComponent } from "./component";
import { ShapeFlags } from "../shared/shapeFlags";
import { Fragment, Text, VNode } from "./vnode";
import { createAppAPI } from "./createApp";

export function createRenderer(options: any) {
    const {
        createElement: hostCreateElement,
        patchProp: hostPatchProp,
        insert: hostInsert
    } = options;

    function render(vnode: any, container: any) {
        patch(vnode, container, null)
    }

    function patch(vnode: VNode, container: any, parentComponent: any) {
        const {type, shapeFlag} = vnode

        switch (type) {
            case Fragment:
                processFragment(vnode, container, parentComponent)
                break;
            case Text:
                processText(vnode, container)
                break;

            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(vnode, container, parentComponent)
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(vnode, container, parentComponent)
                }
                break
        }
    }

    function processFragment(vnode: VNode, container: any, parentComponent: any) {
        mountChildren(vnode, container, parentComponent)
    }

    function processText(vnode: VNode, container: any) {
        const {children} = vnode
        const textNode = vnode.el = document.createTextNode(children)
        container.append(textNode)
    }

    function processElement(vnode: any, container: any, parentComponent: any) {
        mountElement(vnode, container, parentComponent)
    }

    function mountElement(vnode: VNode, container: any, parentComponent: any) {
        const el = vnode.el = hostCreateElement(vnode.type)

        const {children, shapeFlag} = vnode

        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = children
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(vnode, el, parentComponent)
        }

        const {props} = vnode
        for (const key in props) {
            const val = props[key]
            hostPatchProp(el, key, val)
        }

        hostInsert(el, container)
    }

    function mountChildren(vnode: any, container: any, parentComponent: any) {
        const {children} = vnode
        children.forEach((v: any) => patch(v, container, parentComponent))
    }

    function processComponent(vnode: any, container: any, parentComponent: any) {
        mountComponent(vnode, container, parentComponent)
    }

    function mountComponent(initialVNode: any, container: any, parentComponent: any) {
        const instance = createComponentInstance(initialVNode, parentComponent)

        setupComponent(instance)
        setupRenderEffect(instance, initialVNode, container)
    }

    function setupRenderEffect(instance: any, initialVNode: any, container: any) {
        const {proxy} = instance
        const subTree = instance.render.call(proxy)
        patch(subTree, container, instance)

        initialVNode.el = subTree.el
    }

    return {
        createApp: createAppAPI(render)
    }
}