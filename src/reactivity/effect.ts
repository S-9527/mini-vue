import { extend } from "../shared";

let activeEffect: ReactiveEffect | undefined;
let shouldTrack = false;

export class ReactiveEffect {
    private _fn: () => any
    deps: any[] = []
    active = true
    onStop?: () => void
    public scheduler: Function | undefined
    constructor(fn: () => any, scheduler?: Function) {
        this._fn = fn
        this.scheduler = scheduler
    }
    run() {
        activeEffect = this
        if (!this.active) {
            return this._fn()
        }

        shouldTrack = true
        activeEffect = this

        const result = this._fn()
        shouldTrack = false

        return result
    }
    stop() {
        if (this.active) {
            cleanupEffect(this)
            if (this.onStop) {
                this.onStop()
            }
        }
        this.active = false
    }
}

function cleanupEffect(effect: ReactiveEffect) {
    effect.deps.forEach((dep: any) => {
        dep.delete(effect)
    })
    effect.deps.length = 0
}

const targetMap = new Map();
export function track(target: object, key: string | symbol) {
    if (!isTracking()) return;

    let depsMap = targetMap.get(target);

    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()));
    }

    let dep = depsMap.get(key);

    if (!dep){
        depsMap.set(key, (dep = new Set()));
    }

    trackEffects(dep)
}

export function trackEffects(dep: any) {
    if (dep.has(activeEffect)) return;
    dep.add(activeEffect);
    activeEffect?.deps.push(dep);
}

export function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}

export function trigger(target: object, key: string | symbol) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);

    triggerEffects(dep)
}

export function triggerEffects(dep: any) {
    for (let effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        } else {
            effect.run();
        }
    }
}

export function effect(fn: () => any, options: any = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler)

    extend(_effect, options)

    _effect.run()

    const runner: any = _effect.run.bind(_effect)
    runner.effect = _effect

    return runner
}

export function stop(runner: any) {
    runner.effect.stop()
}