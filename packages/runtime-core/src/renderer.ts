import { createComponentInstance, setupComponent } from "./component";
import { shouldUpdateComponent } from "./componentRenderUtils";
import { ShapeFlags, EMPTY_OBJ } from "@mini-vue/shared";
import { Fragment, Text, VNode } from "./vnode";
import { createAppAPI } from "./createApp";
import { effect } from "@mini-vue/reactivity";
import { queueJobs } from "./scheduler";

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
        } else {
            /* 中间对比 */
            let s1 = i
            let s2 = i

            const toBePatched = e2 - s2 + 1
            let patched = 0
            const keyToNewIndexMap = new Map()
            const newIndexToOldIndexMap = new Array(toBePatched).fill(0)
            let moved = false
            let maxIndexSoFar = 0

            for (let i = s2; i <= e2; i++) {
                const nextChild = c2[i]
                keyToNewIndexMap.set(nextChild.key, i)
            }

            for (let i = s1; i <= e1; i++) {
                const prevChild = c1[i]

                if (patched >= toBePatched) {
                    hostRemove(prevChild.el)
                    continue
                }

                let newIndex: any
                if (prevChild.key !== null) {
                    newIndex = keyToNewIndexMap.get(prevChild.key)
                } else {
                    for (let j = s2; j <= e2; j++) {
                        if (isSomeVNodeType(prevChild, c2[j])) {
                            newIndex = j
                            break
                        }
                    }
                }

                if (newIndex === undefined) {
                    hostRemove(prevChild.el)
                } else {
                    if (newIndex >= maxIndexSoFar) {
                        maxIndexSoFar = newIndex
                    } else {
                        moved = true
                    }

                    newIndexToOldIndexMap[newIndex - s2] = i + 1
                    patch(prevChild, c2[newIndex], container, parentComponent, null)
                    patched++
                }
            }

            const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : []
            let j = increasingNewIndexSequence.length - 1

            for (let i = toBePatched - 1; i >= 0;  i--) {
                const nextIndex = s2 + i
                const nextChild = c2[nextIndex]
                const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null

                if (newIndexToOldIndexMap[i] === 0) {
                    patch(null, nextChild, container, parentComponent, anchor)
                } else if (moved) {
                    if (j < 0 || i!== increasingNewIndexSequence[j]) {
                        hostInsert(nextChild.el, container, anchor)
                    } else {
                        j--
                    }
                }
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
        if (!n1) {
            mountComponent(n2, container, parentComponent, anchor)
        } else {
            updateComponent(n1, n2)
        }
    }

    function updateComponent(n1: VNode, n2: VNode) {
        const instance = (n2.component = n1.component)
        if (shouldUpdateComponent(n1, n2)) {
            instance.next = n2
            instance.update()
        } else {
            n2.el = n1.el
            instance.vnode = n2
        }
    }

    function mountComponent(initialVNode: any, container: any, parentComponent: any, anchor: any) {
        const instance= initialVNode.component = createComponentInstance(
            initialVNode,
            parentComponent
        )

        setupComponent(instance)
        setupRenderEffect(instance, initialVNode, container, anchor)
    }

    function setupRenderEffect(instance: any, initialVNode: any, container: any, anchor: any) {
      instance.update = effect(
          () => {
            if (!instance.isMounted) {
                console.log("init")
                const { proxy } = instance
                const subTree = instance.subTree = instance.render.call(proxy, proxy)
                patch(null,subTree, container, instance, anchor)
                initialVNode.el = subTree.el

                instance.isMounted = true
            } else {
                console.log("update")
                const { next, vnode } = instance
                if (next) {
                    next.el = vnode.el
                    updateComponentPreRender(instance, next)
                }

                const { proxy } = instance
                const subTree = instance.render.call(proxy, proxy)
                const prevSubTree = instance.subTree
                instance.subTree = subTree

                patch(prevSubTree, subTree, container, instance, anchor)
            }
        },
          {
              scheduler() {
                  queueJobs(instance.update)
              }
          })
    }

    return {
        createApp: createAppAPI(render)
    }
}

function updateComponentPreRender(instance: any, nextVNode: any) {
    instance.vnode = nextVNode
    instance.next = null
    instance.props = nextVNode.props
}

function getSequence(arr: number[]): number[] {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }
            u = 0;
            v = result.length - 1;
            while (u < v) {
                c = (u + v) >> 1;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                } else {
                    v = c;
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}