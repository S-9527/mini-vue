import { createComponentInstance, setupComponent } from "./component";
import { ShapeFlags } from "../shared/shapeFlags";
import { VNode } from "./vnode";

export function render(vnode: any, container: any) {
    patch( vnode, container)
}

function patch(vnode: VNode, container: any) {
    const { shapeFlags } = vnode
    if (shapeFlags & ShapeFlags.ELEMENT) {
        processElement(vnode, container)
    } else if (shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container)
    }
}

function processElement(vnode: any, container: any) {
    mountElement(vnode, container)
}

function mountElement(vnode: VNode, container: any) {
    const el = vnode.el = document.createElement(vnode.type)
    const { children, shapeFlags } = vnode

    if (shapeFlags & ShapeFlags.TEXT_CHILDREN) {
        el.textContent = children
    } else if (shapeFlags & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(vnode, el)
    }

    const { props } = vnode
    for (const key in props) {
        const val = props[key]
        el.setAttribute(key, val)
    }

    container.append(el)
}

function mountChildren(vnode: any, container: any) {
    const { children } = vnode
    children.forEach((v: any) => patch(v, container))
}

function processComponent(vnode: any, container: any) {
    mountComponent(vnode, container)
}

function mountComponent(initialVNode: any, container: any) {
    const instance = createComponentInstance(initialVNode)

    setupComponent(instance)
    setupRenderEffect(instance, initialVNode, container)
}

function setupRenderEffect(instance: any, initialVNode: any, container: any) {
    const { proxy } = instance
    const subTree = instance.render.call(proxy)
    patch(subTree, container)

    initialVNode.el = subTree.el
}