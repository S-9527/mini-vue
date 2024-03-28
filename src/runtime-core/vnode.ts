import { ShapeFlags } from "../shared/shapeFlags";
export interface VNode {
    type: any
    props: any
    children: any
    el: any
    shapeFlag: number
}

export function createVNode(type: any, props?: any, children?: any) {
    const vnode: VNode = {
        type,
        props,
        children,
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

function getShapeFlag(type: any) {
    return typeof type === 'string'
        ? ShapeFlags.ELEMENT
        : ShapeFlags.STATEFUL_COMPONENT
}