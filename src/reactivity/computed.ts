import { effect } from "./effect"
import { ReactiveEffect } from './effect'

class ComputedRefImpl {
    private _getter: any
    dirty = true
    private _effect: ReactiveEffect
    private _value: any
    constructor(getter) {
        this._getter = getter
        this._effect = new ReactiveEffect(this._getter, () => { this.dirty = true })
    }

    get value() {
        if (this.dirty) {
            this._value = this._effect.run()
            this.dirty = false
        }
        return this._value
    }
}

export const computed = (getter) => {
    return new ComputedRefImpl(getter)
}