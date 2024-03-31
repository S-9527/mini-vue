import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { initProps } from "./componentProps";
import { initSlots } from "./componentSlots";
import { shallowReadonly, proxyRefs } from "@mini-vue/reactivity";
import { emit } from "./componentEmit";

export function createComponentInstance(vnode: any, parent: any) {
    console.log("createComponentInstance", parent)
    const component = {
        vnode,
        type: vnode.type,
        next: null,
        setupState: {},
        props: {},
        slots: {},
        subTree: {},
        provides: parent ? parent.provides : {},
        isMounted: false,
        parent,
        emit: () => {},
    };

    component.emit = emit.bind(null, component) as any

    return component
}

export function setupComponent(instance: any) {
    initProps(instance, instance.vnode.props)
    initSlots(instance, instance.vnode.children)
    setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: any) {
    const Component = instance.type

    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)

    const { setup } = Component

    if (setup) {
        setCurrentInstance(instance)
        const setupResult = setup(shallowReadonly(instance.props),{
            emit: instance.emit
        })
        setCurrentInstance(null)

        handleSetupResult(instance, setupResult)
    }
}

function handleSetupResult(instance: any, setupResult: any) {
    if (typeof setupResult === 'object') {
        instance.setupState = proxyRefs(setupResult)
    }

    finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
    const Component = instance.type

    if (compiler && !Component.render) {
        if (Component.template){
            Component.render = compiler(Component.template)
        }
    }

    instance.render = Component.render
}

let currentInstance: any = null
export function getCurrentInstance() {
    return currentInstance
}

export function setCurrentInstance(instance: any) {
    currentInstance = instance
}

let compiler: any
export function registerRuntimeCompiler(_compiler: any) {
    compiler = _compiler
}