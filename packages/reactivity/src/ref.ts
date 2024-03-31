import { isTracking, trackEffects, triggerEffects } from "./effect";
import { hasChanged, isObject } from "@mini-vue/shared";
import { reactive } from "./reactive";

class RefImpl<T> {
    private _value: T
    private _rawValue: T
    public dep
    public __v_isRef = true

    constructor(value: T) {
        this._value = convert(value)
        this._rawValue = value
        this.dep = new Set()
    }

    get value() {
        trackRefValue(this)
        return this._value
    }

    set value(newValue) {
        if (hasChanged(newValue, this._rawValue)) {
            this._value = convert(newValue)
            this._rawValue = newValue
            triggerEffects(this.dep)
        }
    }
}

function convert(value: any) {
    return isObject(value) ? reactive(value) : value
}

function trackRefValue(ref: any) {
    if (isTracking()) {
        trackEffects(ref.dep)
    }
}

export function ref<T>(value: T) {
    return new RefImpl(value)
}

export function isRef<T>(ref: RefImpl<T> | T): ref is RefImpl<T> {
    return !!(ref as RefImpl<T>)?.__v_isRef;
}


export function unRef<T>(ref: RefImpl<T> | T) {
    return isRef(ref) ? ref.value : ref
}

export function proxyRefs(objectWithRefs: any) {
    return new Proxy(objectWithRefs, {
        get(target, key) {
            return unRef(Reflect.get(target, key))
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                return target[key].value = value
            } else {
                return Reflect.set(target, key, value)
            }
        }
    })
}