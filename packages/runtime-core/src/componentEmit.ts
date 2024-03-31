import { camelize, toHandlerKey } from "@mini-vue/shared";

export function emit(instance: any, event: string, ...args: any[]) {
    console.log("emit" + event)
    const { props } = instance

    const handlerName = toHandlerKey(camelize(event))
    const handler = props[handlerName]
    handler && handler(...args)
}