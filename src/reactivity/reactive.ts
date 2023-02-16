import { track, trigger } from "./effect"

export function reactive(raw) {
    return new Proxy(raw, {
        get(target, key) {
            const result = Reflect.get(target, key)
            //收集依赖
            track(target, key)
            return result
        },
        set(target, key, newValue) {
            const result = Reflect.set(target, key, newValue)
            //触发依赖
            trigger(target, key)
            return result
        }
    })
}