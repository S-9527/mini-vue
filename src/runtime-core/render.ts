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
        patch(null,vnode, container, null, null)
    }

    /**
     * @param n1 老的
     * @param n2 新的
     * @param container
     * @param parentComponent
     * @param anchor
     */
    function patch(n1: VNode | null, n2: VNode, container: any, parentComponent: any, anchor: any) {
        const { type, shapeFlag} = n2

        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent, anchor)
                break;
            case Text:
                processText(n1,n2, container)
                break;

            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1,n2, container, parentComponent, anchor)
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(n1,n2, container, parentComponent, anchor)
                }
                break
        }
    }

    function processFragment(n1: VNode | null, n2: VNode, container: any, parentComponent: any, anchor: any) {
        mountChildren(n2.children, container, parentComponent, anchor)
    }

    function processText(n1: VNode | null, n2: VNode, container: any) {
        const {children} = n2
        const textNode = n2.el = document.createTextNode(children)
        container.append(textNode)
    }

    function processElement(n1: VNode | null, n2: VNode, container: any, parentComponent: any, anchor: any) {
        if (!n1) {
            mountElement(n2, container, parentComponent, anchor)
        } else {
            patchElement(n1, n2, container, parentComponent, anchor)
        }
    }

    function patchElement(n1: VNode, n2: VNode, container: any, parentComponent: any, anchor: any) {
        console.log("patchElement")
        console.log("n1", n1)
        console.log("n2", n2)

        const oldProps = n1.props || EMPTY_OBJ
        const newProps = n2.props || EMPTY_OBJ

        const el = n2.el = n1.el

        patchChildren(n1, n2, el, parentComponent, anchor)
        patchProps(el, oldProps, newProps)
    }

    function patchChildren(n1: VNode, n2: VNode, container: any, parentComponent: any, anchor: any) {
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
                mountChildren(c2, container, parentComponent, anchor)
            } else {
                patchKeyedChildren(c1, c2, container, parentComponent, anchor)
            }
        }
    }

    /**
     * @param c1 老的
     * @param c2 新的
     * @param container
     * @param parentComponent
     * @param parentAnchor
     */
    function patchKeyedChildren(c1: any, c2: any, container: any, parentComponent: any, parentAnchor: any) {
        let i = 0

        /* 索引 */
        let l2 = c2.length
        let e1 = c1.length - 1
        let e2 = l2 - 1

        function isSomeVNodeType(n1: any, n2: any) {
            return n1.type === n2.type && n1.key === n2.key
        }

        /* 左侧对比 */
        while (i <= e1 && i <= e2) {
            const n1 = c1[i]
            const n2 = c2[i]

            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor)
            } else {
                break
            }
            i++
        }

        /* 右侧对比 */
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1]
            const n2 = c2[e2]

            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor)
            } else {
                break
            }

            e1--
            e2--
        }

        /* 新的比老的多 创建 */
        if (i > e1) {
            if (i <= e2) {
                const nextPos = e2 + 1
                const anchor = nextPos < l2 ? c2[nextPos].el : null
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor)
                    i++
                }
            }
        } else if (i > e2) {
            /* 老的比新的多 删除 */
            while (i <= e1) {
                hostRemove(c1[i].el)
                i++
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

    function mountElement(vnode: VNode, container: any, parentComponent: any, anchor: any) {
        const el = vnode.el = hostCreateElement(vnode.type)

        const {children, shapeFlag} = vnode

        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = children
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(vnode.children, el, parentComponent, anchor)
        }

        const {props} = vnode
        for (const key in props) {
            const val = props[key]
            hostPatchProp(el, key, null, val)
        }

        hostInsert(el, container, anchor)
    }

    function mountChildren(children: any, container: any, parentComponent: any, anchor: any) {
        children.forEach((v: any) => patch(null, v, container, parentComponent, anchor))
    }

    function unmountChildren(children: any) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el
            hostRemove(el)
        }
    }

    function processComponent(n1: VNode | null, n2: VNode, container: any, parentComponent: any, anchor: any) {
        mountComponent(n2, container, parentComponent, anchor)
    }

    function mountComponent(initialVNode: any, container: any, parentComponent: any, anchor: any) {
        const instance = createComponentInstance(initialVNode, parentComponent)

        setupComponent(instance)
        setupRenderEffect(instance, initialVNode, container, anchor)
    }

    function setupRenderEffect(instance: any, initialVNode: any, container: any, anchor: any) {
        effect(() => {
            if (!instance.isMounted) {
                console.log("init")
                const { proxy } = instance
                const subTree = instance.subTree = instance.render.call(proxy)
                patch(null,subTree, container, instance, anchor)
                initialVNode.el = subTree.el

                instance.isMounted = true
            } else {
                console.log("update")
                const { proxy } = instance
                const subTree = instance.render.call(proxy)
                const prevSubTree = instance.subTree
                instance.subTree = subTree

                patch(prevSubTree, subTree, container, instance, anchor)
            }
        })
    }

    return {
        createApp: createAppAPI(render)
    }
}