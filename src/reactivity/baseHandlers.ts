
import { track, trigger } from "./effect"

function createGetter(isReadonly = false) {
    return function get(target, key) {
        const result = Reflect.get(target, key)
        //收集依赖
        if (!isReadonly) {
            track(target, key)
        }
        return result
    }
}

function createSetter() {
    return function set(target, key, newValue) {
        const result = Reflect.set(target, key, newValue)
        //触发依赖
        trigger(target, key)
        return result
    }
}

function readonlySetter() {
    return function set(target) {
        console.warn(target + "不能不调用")
        return true
    }
}
export function mutableHandlers() {
    return {
        get: createGetter(),
        set: createSetter()
    }
}

export function readonlyHandles() {
    return {
        get: createGetter(true),
        set: readonlySetter()
    }
}