import { ShapeFlags } from "../shared/shapeFlags";
export interface VNode {
    type: any
    props: any
    children: any
    el: any
    shapeFlags: number
}

export function createVNode(type: any, props?: any, children?: any) {
    const vnode: VNode = {
        type,
        props,
        children,
        shapeFlags: getShapeFlags(type),
        el: null
    };

    if (typeof children === 'string') {
        vnode.shapeFlags |= ShapeFlags.TEXT_CHILDREN;
    } else if (Array.isArray(children)) {
        vnode.shapeFlags |= ShapeFlags.ARRAY_CHILDREN;
    }

    return vnode;
}

function getShapeFlags(type: any) {
    return typeof type === 'string'
        ? ShapeFlags.ELEMENT
        : ShapeFlags.STATEFUL_COMPONENT
}