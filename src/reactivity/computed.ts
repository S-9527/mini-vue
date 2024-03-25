import { ReactiveEffect } from "./effect";

class ComputedRefImpl<T> {
    private _dirty = true
    private _value: T | undefined;
    private _effect: ReactiveEffect;

    constructor(getter: () => T) {
        this._effect = new ReactiveEffect(getter, () => {
            if (!this._dirty) {
                this._dirty = true
            }
        })
    }

    get value() {
        if (this._dirty) {
            this._dirty = false
            this._value = this._effect.run()
        }

        return this._value
    }
}

export function computed<T>(getter: () => T) {
    return new ComputedRefImpl(getter)
}