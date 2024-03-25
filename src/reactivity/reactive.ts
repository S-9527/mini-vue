import { mutableHandlers, readonlyHandlers } from "./baseHandlers";

export function reactive<T extends object>(target: T) {
    return createActiveObject<T>(target, mutableHandlers)
}

export function readonly<T extends object>(target: T) {
    return createActiveObject<T>(target, readonlyHandlers)
}

function createActiveObject<T extends object>(target: T, baseHandlers: ProxyHandler<T>) {
    return new Proxy(target, baseHandlers)
}