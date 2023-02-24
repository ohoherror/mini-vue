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

const publicPropertiesMap = {
    $el: (i) => i.vnode.$el
};
const PublicInstanceProxyHandles = {
    get({ _: instance }, key) {
        const { setupState } = instance;
        if (key in setupState) {
            return instance.setupState[key];
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
        setupState: {}
    };
    return component;
}
function setupComponent(instance, container) {
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const component = instance.type;
    const { setup } = component;
    if (setup) {
        const setupResult = setup();
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
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
}
function setupRenderEffect(instance, initialVNode, container) {
    let proxy = instance.proxy;
    const subTree = instance.render.call(proxy);
    patch(subTree, container);
    initialVNode.$el = subTree.$el;
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const { type: domElType, props, children, shapeFlags } = vnode;
    const domEl = document.createElement(domElType);
    for (const prop in props) {
        domEl.setAttribute(prop, props[prop]);
    }
    if (shapeFlags && ShapeFlags.TEXT_CHILDREN) {
        domEl.textContent = children;
    }
    else if (shapeFlags && ShapeFlags.ARRAY_CHILDREN) {
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
