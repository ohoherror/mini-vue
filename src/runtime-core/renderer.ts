import { ShapeFlags } from "../shared/ShapeFlag"
import { createComponentInstance, setupComponent } from "./component"
import { Fragment, TextNode } from "./vnode"


export function render(vnode, container) {
    patch(vnode, container, null)
}

export function patch(vnode, container, parentComponent) {
    const { type, shapeFlags } = vnode
    switch (type) {
        case Fragment:
            processFragment(vnode, container, parentComponent)
            break
        case TextNode:
            processTextNode(vnode, container, parentComponent)
            break
        default:
            //(0001|0101|1001)&0001 >0为true
            if (shapeFlags & ShapeFlags.ELEMENT) {
                processElement(vnode, container, parentComponent)
            } else if (shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
                processComponent(vnode, container, parentComponent)
            }
            break
    }
}

export function processComponent(vnode, container, parentComponent) {
    mountComponent(vnode, container, parentComponent)
}

export function mountComponent(initialVNode, container, parentComponent) {
    const instance = createComponentInstance(initialVNode, parentComponent)
    //先处理setup里面的数据，把setup放在this里面去
    setupComponent(instance)
    //处理render里面的数据，重新patch
    setupRenderEffect(instance, initialVNode, container)
}

function setupRenderEffect(instance, initialVNode, container) {
    //this指向setup里面的对象
    let proxy = instance.proxy
    const subTree = instance.render.call(proxy)
    patch(subTree, container, instance)
    //父级获取子集的dom树
    initialVNode.el = subTree.el
}

function processElement(vnode: any, container: any, parentComponent) {
    mountElement(vnode, container, parentComponent)
}

function processFragment(vnode: any, container: any, parentComponent) {
    mountChildren(vnode, container, parentComponent)
}


function processTextNode(vnode: any, container: any, parentComponent) {
    const element = (vnode.el = document.createTextNode(vnode.children))
    container.appendChild(element)
}

function mountElement(vnode: any, container: any, parentComponent) {
    //type里面放标签名，如：div,button等
    //props里面放样式、事件等
    //children里面放内容
    //此时的shapeFlags只有字符串类型或数组类型
    const { type: domElType, props, children, shapeFlags, parent } = vnode

    const domEl = document.createElement(domElType)
    for (const prop in props) {
        let isEvent = (key) => /^on[A-Z]/.test(key)
        if (isEvent(prop)) {
            const event = prop.slice(2).toLowerCase()
            console.log(domEl)
            domEl.addEventListener(event, props[prop])
        } else {
            domEl.setAttribute(prop, props[prop])
        }

    }
    if (shapeFlags & ShapeFlags.TEXT_CHILDREN) {
        domEl.textContent = children
    } else if (shapeFlags & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(vnode, domEl, parentComponent)
    }
    vnode.el = domEl
    container.appendChild(domEl)
}

function mountChildren(vnode: any, container: any, parentComponent) {
    vnode.children.forEach((v) => {
        patch(v, container, parentComponent);
    });
}


