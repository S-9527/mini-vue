import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from "./baseHandlers";

export enum ReactiveFlags {
    IS_REACTIVE = "__v_isReactive",
    IS_READONLY = "__v_isReadonly"
}

export function reactive<T extends object>(target: T) {
    return createActiveObject<T>(target, mutableHandlers)
}

export function readonly<T extends object>(target: T) {
    return createActiveObject<T>(target, readonlyHandlers)
}

export function shallowReadonly<T extends object>(target: T) {
    return createActiveObject<T>(target, shallowReadonlyHandlers)
}

export function isReactive(value: any) {
    return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(value: any) {
    return !!value[ReactiveFlags.IS_READONLY]
}

function createActiveObject<T extends object>(target: T, baseHandlers: ProxyHandler<T>) {
    return new Proxy(target, baseHandlers)
}