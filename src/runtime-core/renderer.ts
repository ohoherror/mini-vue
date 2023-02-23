import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {
    patch(vnode, container)
}

export function patch(vnode, container) {
    if (typeof vnode.type === 'string') {
        processElement(vnode, container)
    } else {
        processComponent(vnode, container)
    }
}

export function processComponent(vnode, container) {
    mountComponent(vnode, container)
}

export function mountComponent(initialVNode, container) {
    const instance = createComponentInstance(initialVNode)
    setupComponent(instance, container)
    setupRenderEffect(instance, initialVNode, container)
}

function setupRenderEffect(instance, initialVNode, container) {
    let proxy = instance.proxy
    const subTree = instance.render.call(proxy)
    patch(subTree, container)
    initialVNode.$el = subTree.$el
}

function processElement(vnode: any, container: any) {
    mountElement(vnode, container)
}
function mountElement(vnode: any, container: any) {
    const { type: domElType, props, children } = vnode

    const domEl = document.createElement(domElType)
    for (const prop in props) {
        domEl.setAttribute(prop, props[prop])
    }
    if (typeof children === 'string') {
        domEl.textContent = children
    } else if (Array.isArray(children)) {
        mountChildren(vnode, domEl)
    }
    vnode.$el = domEl
    container.appendChild(domEl)
}

function mountChildren(vnode: any, container: any) {
    vnode.children.forEach(vnode => {
        patch(vnode, container)
    })
}

