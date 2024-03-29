import { createComponentInstance, setupComponent } from "./component";
import { ShapeFlags } from "../shared/shapeFlags";
import { Fragment, Text, VNode } from "./vnode";
import { createAppAPI } from "./createApp";
import { effect } from "../reactivity/effect";
import { EMPTY_OBJ } from "../shared";

export function createRenderer(options: any) {
    const {
        createElement: hostCreateElement,
        patchProp: hostPatchProp,
        insert: hostInsert,
        remove: hostRemove,
        setElementText: hostSetElementText
    } = options;

    function render(vnode: any, container: any) {
        patch(null,vnode, container, null)
    }

    /**
     * @param n1 老的
     * @param n2 新的
     * @param container
     * @param parentComponent
     */
    function patch(n1: VNode | null, n2: VNode, container: any, parentComponent: any) {
        const { type, shapeFlag} = n2

        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent)
                break;
            case Text:
                processText(n1,n2, container)
                break;

            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1,n2, container, parentComponent)
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(n1,n2, container, parentComponent)
                }
                break
        }
    }

    function processFragment(n1: VNode | null, n2: VNode, container: any, parentComponent: any) {
        mountChildren(n2.children, container, parentComponent)
    }

    function processText(n1: VNode | null, n2: VNode, container: any) {
        const {children} = n2
        const textNode = n2.el = document.createTextNode(children)
        container.append(textNode)
    }

    function processElement(n1: VNode | null, n2: VNode, container: any, parentComponent: any) {
        if (!n1) {
            mountElement(n2, container, parentComponent)
        } else {
            patchElement(n1, n2, container, parentComponent)
        }
    }

    function patchElement(n1: VNode, n2: VNode, container: any, parentComponent: any) {
        console.log("patchElement")
        console.log("n1", n1)
        console.log("n2", n2)

        const oldProps = n1.props || EMPTY_OBJ
        const newProps = n2.props || EMPTY_OBJ

        const el = n2.el = n1.el

        patchChildren(n1, n2, el, parentComponent)
        patchProps(el, oldProps, newProps)
    }

    function patchChildren(n1: VNode, n2: VNode, container: any, parentComponent: any) {
        const { shapeFlag: prevShapeFlag, children: c1 } = n1
        const { shapeFlag, children: c2 } = n2
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                unmountChildren(c1)
            }
            if (c1 !== c2) {
                hostSetElementText(container, c2)
            }
        } else {
            if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                hostSetElementText(container, '')
                mountChildren(c2, container, parentComponent)
            }
        }
    }

    function patchProps(el: any, oldProps: any, newProps: any) {
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const prevProp = oldProps[key]
                const nextProp = newProps[key]
                if (prevProp !== nextProp) {
                    hostPatchProp(el, key, prevProp, nextProp)
                }
            }

            if (oldProps !== EMPTY_OBJ) {
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null)
                    }
                }
            }
        }
    }

    function mountElement(vnode: VNode, container: any, parentComponent: any) {
        const el = vnode.el = hostCreateElement(vnode.type)

        const {children, shapeFlag} = vnode

        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = children
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(vnode.children, el, parentComponent)
        }

        const {props} = vnode
        for (const key in props) {
            const val = props[key]
            hostPatchProp(el, key, null, val)
        }

        hostInsert(el, container)
    }

    function mountChildren(children: any, container: any, parentComponent: any) {
        children.forEach((v: any) => patch(null, v, container, parentComponent))
    }

    function unmountChildren(children: any) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el
            hostRemove(el)
        }
    }

    function processComponent(n1: VNode | null, n2: VNode, container: any, parentComponent: any) {
        mountComponent(n2, container, parentComponent)
    }

    function mountComponent(initialVNode: any, container: any, parentComponent: any) {
        const instance = createComponentInstance(initialVNode, parentComponent)

        setupComponent(instance)
        setupRenderEffect(instance, initialVNode, container)
    }

    function setupRenderEffect(instance: any, initialVNode: any, container: any) {
        effect(() => {
            if (!instance.isMounted) {
                console.log("init")
                const { proxy } = instance
                const subTree = instance.subTree = instance.render.call(proxy)
                patch(null,subTree, container, instance)
                initialVNode.el = subTree.el

                instance.isMounted = true
            } else {
                console.log("update")
                const { proxy } = instance
                const subTree = instance.render.call(proxy)
                const prevSubTree = instance.subTree
                instance.subTree = subTree

                patch(prevSubTree, subTree, container, instance)
            }
        })
    }

    return {
        createApp: createAppAPI(render)
    }
}