import { ShapeFlags } from "../shared/ShapeFlag"
import { createComponentInstance, setupComponent } from "./component"


export function render(vnode, container) {
    patch(vnode, container)
}

export function patch(vnode, container) {
    const { shapeFlags } = vnode
    //(0001|0101|1001)&0001 >0为true
    if (shapeFlags & ShapeFlags.ELEMENT) {
        processElement(vnode, container)
    } else if (shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
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
    const { type: domElType, props, children, shapeFlags } = vnode

    const domEl = document.createElement(domElType)
    for (const prop in props) {
        domEl.setAttribute(prop, props[prop])
    }
    if (shapeFlags && ShapeFlags.TEXT_CHILDREN) {
        domEl.textContent = children
    } else if (shapeFlags && ShapeFlags.ARRAY_CHILDREN) {
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

