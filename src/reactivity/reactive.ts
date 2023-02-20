
import { mutableHandlers, readonlyHandlers } from './baseHandlers'


export const enum ReactiveFlags {
    IS_REACTIVE = "_v_isReactive",
    IS_READONLY = "_v_isReadonly"
}

export function reactive(raw) {
    return createReactiveObject(raw, mutableHandlers)
}

export function readonly(raw) {
    return createReactiveObject(raw, readonlyHandlers)
}

function createReactiveObject(target, baseHandlers) {
    return new Proxy(target, baseHandlers)
}

export function isReadonly(value) {
    return !!value[ReactiveFlags.IS_READONLY]
}

export function isReactive(value) {
    return !!value[ReactiveFlags.IS_REACTIVE]
}