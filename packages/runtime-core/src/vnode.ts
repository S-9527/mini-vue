import { ShapeFlags } from "@mini-vue/shared";

export const Fragment = Symbol("Fragment");
export const Text = Symbol("Text");

export {
    createVNode as createElementVNode
}

export interface VNode {
    type: any
    props: any
    children: any,
    component: any
    key: any
    el: any
    shapeFlag: number
}

export function createVNode(type: any, props?: any, children?: any) {
    const vnode: VNode = {
        type,
        props,
        children,
        component: null,
        key: props && props.key,
        shapeFlag: getShapeFlag(type),
        el: null
    };

    if (typeof children === 'string') {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    } else if (Array.isArray(children)) {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    }

    if(vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
        if(typeof children === "object"){
            vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN
        }
    }

    return vnode;
}

export function createTextVNode(text: string) {
    return createVNode(Text, {}, text)
}

function getShapeFlag(type: any) {
    return typeof type === 'string'
        ? ShapeFlags.ELEMENT
        : ShapeFlags.STATEFUL_COMPONENT
}