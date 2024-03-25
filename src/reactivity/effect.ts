class ReactiveEffect {
    private _fn: () => any
    constructor(fn: () => any) {
        this._fn = fn
    }
    run() {
        activeEffect = this
        return this._fn()
    }
}

const targetMap = new Map();
export function track(target: object, key: string | symbol) {
    let depsMap = targetMap.get(target);

    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()));
    }

    let dep = depsMap.get(key);

    if (!dep){
        depsMap.set(key, (dep = new Set()));
    }

    dep.add(activeEffect);
}

export function trigger(target: object, key: string | symbol) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);

    for (let effect of dep) {
        effect.run();
    }
}

let activeEffect: ReactiveEffect | undefined;
export function effect(fn: () => any) {
    const _effect = new ReactiveEffect(fn)
    _effect.run()
    return _effect.run.bind(_effect)
}