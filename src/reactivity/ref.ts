import { isTracking, trackEffects, triggerEffects } from "./effect";
import { hasChanged, isObject } from "../shared";
import { reactive } from "./reactive";

class RefImpl<T> {
    private _value: T
    private _rawValue: T
    public dep

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
