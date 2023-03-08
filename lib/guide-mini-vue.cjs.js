'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// export const ShapeFlag = {
//     isElement: (vnode) => typeof vnode.type === 'string',
//     isComponent: (vnode) => typeof vnode.type !== 'string',
//     isElementChildren: (children) => typeof children === 'string',
//     isElementArray: (children) => Array.isArray(children)
// }
const ShapeFlags = {
    ELEMENT: 1,
    STATEFUL_COMPONENT: 1 << 1,
    TEXT_CHILDREN: 1 << 2,
    ARRAY_CHILDREN: 1 << 3,
    SLOT_CHILDREN: 1 << 4 // 10000
};

const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
        el: null,
    };
    if (typeof children === "string") {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    }
    if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        if (typeof children === "object") {
            vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN;
        }
    }
    return vnode;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}
function getShapeFlag(type) {
    return typeof type === "string"
        ? ShapeFlags.ELEMENT
        : ShapeFlags.STATEFUL_COMPONENT;
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

const renderSlots = (slots, key, props) => {
    let slot = slots[key];
    if (slot) {
        if (typeof slot === 'function') {
            return createVNode(Fragment, {}, slot(props));
        }
    }
};

const extend = Object.assign;
const isObject = (value) => {
    return value !== null && typeof value === 'object';
};
const hasChanged = (oldValue, newValue) => {
    return !Object.is(oldValue, newValue);
};
const hasOwn = (o, key) => o.hasOwnProperty(key);
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : "";
    });
};
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
const toHandlerKey = (str) => {
    return str ? "on" + capitalize(str) : "";
};

let activeEffect;
let shouldTrack = false;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.deps = [];
        this.active = true;
        this._fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        if (!this.active) {
            shouldTrack = true;
            return this._fn();
        }
        activeEffect = this;
        shouldTrack = true;
        const r = this._fn();
        shouldTrack = false;
        return r;
    }
    stop() {
        cleanupEffect(this);
        if (this.onStop) {
            this.onStop();
        }
        this.active = false;
    }
}
function cleanupEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
}
const targetMap = new Map();
//收集依赖
function track(target, key) {
    if (!isTracking())
        return;
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
    trackEffects(dep);
}
function trackEffects(dep) {
    dep.add(activeEffect);
    if (activeEffect) {
        activeEffect.deps.push(dep);
    }
}
function isTracking() {
    return shouldTrack && activeEffect;
}
//触发依赖
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}
// type effectOptions = {
//     scheduler?: Function;
//     onStop?: any
// };
function effect(fn, options = {}) {
    // fn
    const _effect = new ReactiveEffect(fn);
    extend(_effect, options);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false, isShallowReadonly = false) {
    return function get(target, key) {
        if (key === "_v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "_v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (isObject(res) && !isShallowReadonly) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        if (!isReadonly) {
            track(target, key);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get,
    set,
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key) {
        console.warn(`key :"${String(key)}" set 失败，因为 target 是 readonly 类型`, target);
        return true;
    },
};
const shallowReadonlyHandlers = {
    get: shallowReadonlyGet,
    set(target, key) {
        console.warn(`key :"${String(key)}" set 失败，因为 target 是 readonly 类型`, target);
        return true;
    },
};

function reactive(raw) {
    return createReactiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createReactiveObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createReactiveObject(raw, shallowReadonlyHandlers);
}
function createReactiveObject(target, baseHandlers) {
    return new Proxy(target, baseHandlers);
}

const emit = (instance, event, ...arg) => {
    const { props } = instance;
    const handle = props[toHandlerKey(camelize(event))];
    handle && handle(...arg);
};

const initProps = (instance, props) => {
    instance.props = props || {};
};

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return instance.setupState[key];
        }
        else if (hasOwn(props, key)) {
            return instance.props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

const initSlots = (instance, children) => {
    const { vnode } = instance;
    if (vnode.shapeFlags & ShapeFlags.SLOT_CHILDREN) {
        normalizeObjectSlots(children, instance.slots);
    }
};
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const value = children[key];
        slots[key] = (props) => normalizeSlotValue(value(props));
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

class RefImpl {
    constructor(value) {
        this.v_is_ref = true;
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
function ref(value) {
    return new RefImpl(value);
}
function isRef(value) {
    return !!value.v_is_ref;
}
function unRef(raw) {
    return isRef(raw) ? raw.value : raw;
}
function proxyRefs(raw) {
    return new Proxy(raw, {
        get(target, key) {
            let res = unRef(target[key]);
            return res;
        },
        set(target, key, newValue) {
            if (isRef(target[key]) && !isRef(newValue)) {
                return target[key].value = newValue;
            }
            return Reflect.set(target, key, newValue);
        }
    });
}

function add(a, b) {
    return a + b;
}

function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        emit: () => { },
        provides: parent ? parent.provides : {},
        parent,
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // function Object
    // TODO function
    if (typeof setupResult === "object") {
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    instance.render = Component.render;
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function provide(key, value) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent.provides;
        if (provides === parentProvides) {
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === "function") {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            },
        };
    };
}

function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, } = options;
    function render(vnode, container) {
        patch(vnode, container, null);
    }
    function patch(n2, container, parentComponent) {
        const { type, shapeFlag } = n2;
        switch (type) {
            case Fragment:
                processFragment(n2, container, parentComponent);
                break;
            case Text:
                processText(n2, container);
                break;
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n2, container, parentComponent);
                }
                else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(n2, container, parentComponent);
                }
                break;
        }
    }
    function processText(n2, container) {
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        container.append(textNode);
    }
    function processFragment(n2, container, parentComponent) {
        mountChildren(n2, container, parentComponent);
    }
    function processElement(n2, container, parentComponent) {
        mountElement(n2, container, parentComponent);
    }
    function mountElement(vnode, container, parentComponent) {
        const el = (vnode.el = hostCreateElement(vnode.type));
        const { children, shapeFlag } = vnode;
        // children
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = children;
        }
        else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(vnode, el, parentComponent);
        }
        // props
        const { props } = vnode;
        for (const key in props) {
            const val = props[key];
            hostPatchProp(el, key, val);
        }
        hostInsert(el, container);
    }
    function mountChildren(vnode, container, parentComponent) {
        vnode.children.forEach((v) => {
            patch(v, container, parentComponent);
        });
    }
    function processComponent(n2, container, parentComponent) {
        mountComponent(n2, container, parentComponent);
    }
    function mountComponent(initialVNode, container, parentComponent) {
        const instance = createComponentInstance(initialVNode, parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, initialVNode, container);
    }
    function setupRenderEffect(instance, initialVNode, container) {
        effect(() => {
            console.log("init");
            const { proxy } = instance;
            const subTree = (instance.subTree = instance.render.call(proxy));
            patch(subTree, container, instance);
            initialVNode.el = subTree.el;
            instance.isMounted = true;
            // if (!instance.isMounted) {
            //     console.log("init");
            //     const { proxy } = instance;
            //     const subTree = (instance.subTree = instance.render.call(proxy));
            //     patch(null, subTree, container, instance);
            //     initialVNode.el = subTree.el;
            //     instance.isMounted = true;
            // } else {
            //     console.log("update");
            //     const { proxy } = instance;
            //     const subTree = instance.render.call(proxy);
            //     const prevSubTree = instance.subTree;
            //     instance.subTree = subTree;
            //     patch(prevSubTree, subTree, container, instance);
            // }
        });
    }
    return {
        createApp: createAppAPI(render),
    };
}

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, val) {
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, val);
    }
    else {
        el.setAttribute(key, val);
    }
}
function insert(el, parent) {
    parent.append(el);
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
});
function createApp(...args) {
    return renderer.createApp(...args);
}

exports.add = add;
exports.createApp = createApp;
exports.createRenderer = createRenderer;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.isRef = isRef;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.ref = ref;
exports.renderSlots = renderSlots;
exports.unRef = unRef;
