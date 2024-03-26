import { createComponentInstance, setupComponent } from "./component";
import { isObject } from "../shared";

export function render(vnode: any, container: any) {
    patch( vnode, container)
}

function patch(vnode: any, container: any) {
    if (typeof vnode.type === 'string') {
        processElement(vnode, container)
    } else if (isObject(vnode.type)) {
        processComponent(vnode, container)
    }
}

function processElement(vnode: any, container: any) {
    mountElement(vnode, container)
}

function mountElement(vnode: any, container: any) {
    const el = vnode.el = document.createElement(vnode.type)
    const { children } = vnode

    if (typeof children === 'string') {
        el.textContent = children
    } else if (Array.isArray(children)) {
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