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
    ARRAY_CHILDREN: 1 << 3, //1000
};

const isObject = (value) => {
    return value !== null && typeof value === 'object';
};

const targetMap = new Map();
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

const initProps = (instance, props) => {
    instance.props = shallowReadonly(props || {});
};

const publicPropertiesMap = {
    $el: (i) => i.vnode.$el
};
const PublicInstanceProxyHandles = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (key in setupState) {
            return instance.setupState[key];
        }
        else if (key in props) {
            return instance.props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance.vnode);
        }
    }
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {}
    };
    return component;
}
function setupComponent(instance, container) {
    //初始化props
    initProps(instance, instance.vnode.props);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const component = instance.type;
    const { setup } = component;
    if (setup) {
        const setupResult = setup(instance.props);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const component = instance.type;
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandles);
    instance.render = component.render;
}

function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    const { shapeFlags } = vnode;
    //(0001|0101|1001)&0001 >0为true
    if (shapeFlags & ShapeFlags.ELEMENT) {
        processElement(vnode, container);
    }
    else if (shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container);
    }
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(initialVNode, container) {
    const instance = createComponentInstance(initialVNode);
    //先处理setup里面的数据，把setup放在this里面去
    setupComponent(instance);
    //处理render里面的数据，重新patch
    setupRenderEffect(instance, initialVNode, container);
}
function setupRenderEffect(instance, initialVNode, container) {
    //this指向setup里面的对象
    let proxy = instance.proxy;
    const subTree = instance.render.call(proxy);
    patch(subTree, container);
    //父级获取子集的dom树
    initialVNode.$el = subTree.$el;
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    //type里面放标签名，如：div,button等
    //props里面放样式、事件等
    //children里面放内容
    //此时的shapeFlags只有字符串类型或数组类型
    const { type: domElType, props, children, shapeFlags } = vnode;
    const domEl = document.createElement(domElType);
    for (const prop in props) {
        let isEvent = (key) => /^on[A-Z]/.test(key);
        if (isEvent(prop)) {
            const event = prop.slice(2).toLowerCase();
            domEl.addEventListener(event, props[prop]);
        }
        else {
            domEl.setAttribute(prop, props[prop]);
        }
    }
    if (shapeFlags & ShapeFlags.TEXT_CHILDREN) {
        domEl.textContent = children;
    }
    else if (shapeFlags & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(vnode, domEl);
    }
    vnode.$el = domEl;
    container.appendChild(domEl);
}
function mountChildren(vnode, container) {
    vnode.children.forEach(vnode => {
        patch(vnode, container);
    });
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        $el: null,
        shapeFlags: getShapeFlags(type),
    };
    if (typeof children === 'string') {
        //要添加或逻辑，因为要走ShapeFlags.ELEMENT的逻辑，继续绘制dom
        vnode.shapeFlags |= ShapeFlags.TEXT_CHILDREN; //0001|0100->0101
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlags |= ShapeFlags.ARRAY_CHILDREN;
    }
    return vnode;
}
function getShapeFlags(type) {
    return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            const vnode = createVNode(rootComponent);
            // vnode ={  type,   props,  children}
            render(vnode, document.querySelector(rootContainer));
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
