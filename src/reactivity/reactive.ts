import { track, trigger } from "./effect";

export function reactive<T extends object>(target: T) {
    return new Proxy(target,{
        get(target, key: string | symbol) {
            const res = Reflect.get(target, key);
            track(target, key);
            return res;
        },

        set(target, key: string | symbol, value: any) {
            const res = Reflect.set(target, key, value);
            trigger(target, key);
            return res;
        }
    })
}