class ReactiveEffect {
    private _fn: Function
    constructor(fn) {
        this._fn = fn
    }
    run() {
        activeEffect = this
        this._fn()
    }
}

const targetMap = new Map()
//收集依赖
export function track(target, key) {
    let depsMap = targetMap.get(target)
    if (!depsMap) {
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }
    let dep = depsMap.get(key)
    if (!dep) {
        dep = new Set()
        depsMap.set(key, dep)
    }
    dep.add(activeEffect)
}
//触发依赖
export function trigger(target, key) {
    console.log(target)
    let depsMap = targetMap.get(target)
    let dep = depsMap.get(key)
    for (const effect of dep) {
        effect.run()
    }

}
let activeEffect
export function effect(fn: Function) {
    console.log(fn)
    let _effect = new ReactiveEffect(fn)
    _effect.run()

}