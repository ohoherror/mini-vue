import { hasChanged, isObject } from "../shared";
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";

class RefImpl {
    private _value: any;
    public dep;
    private _rawValue: any;
    v_is_ref = true
    constructor(value) {
        this._rawValue = value;
        this._value = convert(value);
        this.dep = new Set();
    }

    get value() {
        trackRefValue(this);
        return this._value;
    }

    set value(newValue) {
        if (hasChanged(newValue, this._rawValue)) {
            this._rawValue = newValue;
            this._value = convert(newValue);
            triggerEffects(this.dep);
        }
    }
}

function convert(value) {
    return isObject(value) ? reactive(value) : value;
}

function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep);
    }
}

export function ref(value) {
    return new RefImpl(value);
}

export function isRef(value) {
    return !!value.v_is_ref
}

export function unRef(raw) {
    return isRef(raw) ? raw.value : raw
}

export function proxyRefs(raw) {
    return new Proxy(raw, {
        get(target, key) {
            let res = unRef(target[key])
            return res
        },
        set(target, key, newValue) {
            if (isRef(target[key]) && !isRef(newValue)) {
                return target[key].value = newValue
            }
            return Reflect.set(target, key, newValue)
        }
    })
}
