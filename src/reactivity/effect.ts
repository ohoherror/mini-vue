import { extend } from '../shared'

let activeEffect;
let shouldTrack = false

export class ReactiveEffect {
    private _fn: Function;
    public scheduler: Function | undefined;
    deps = []
    active = true
    onStop?: () => void
    constructor(fn: Function, scheduler?) {
        this._fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        if (!this.active) {
            shouldTrack = true
            return this._fn()
        }
        activeEffect = this;
        shouldTrack = true
        const r = this._fn()
        shouldTrack = false
        return r;
    }
    stop() {
        cleanupEffect(this)
        if (this.onStop) {
            this.onStop()
        }
        this.active = false
    }
}

function cleanupEffect(effect: any) {
    effect.deps.forEach((dep: any) => {
        dep.delete(effect)
    });
}
const targetMap = new Map();
//收集依赖
export function track(target, key) {
    if (!isTracking()) return
    // target -> key -> dep
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }

    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffects(dep)

}

export function trackEffects(dep) {
    dep.add(activeEffect);
    if (activeEffect) {
        activeEffect.deps.push(dep)
    }
}

export function isTracking() {
    return shouldTrack && activeEffect
}
//触发依赖
export function trigger(target, key) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerEffects(dep)
}

export function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        } else {
            effect.run();
        }
    }
}

export function stop(runner: any) {
    runner.effect.stop()
}

// type effectOptions = {
//     scheduler?: Function;
//     onStop?: any
// };


export function effect(fn: Function, options: any = {}) {
    // fn
    const _effect: any = new ReactiveEffect(fn);
    extend(_effect, options)
    _effect.run();

    const runner: any = _effect.run.bind(_effect);
    runner.effect = _effect

    return runner;
}