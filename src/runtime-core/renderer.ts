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
    //先处理setup里面的数据，把setup放在this里面去
    setupComponent(instance)
    //处理render里面的数据，重新patch
    setupRenderEffect(instance, initialVNode, container)
}

function setupRenderEffect(instance, initialVNode, container) {
    //this指向setup里面的对象
    let proxy = instance.proxy
    const subTree = instance.render.call(proxy)
    patch(subTree, container)
    //父级获取子集的dom树
    initialVNode.el = subTree.el
}

function processElement(vnode: any, container: any) {
    mountElement(vnode, container)
}
function mountElement(vnode: any, container: any) {
    //type里面放标签名，如：div,button等
    //props里面放样式、事件等
    //children里面放内容
    //此时的shapeFlags只有字符串类型或数组类型
    const { type: domElType, props, children, shapeFlags } = vnode

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
        mountChildren(vnode, domEl)
    }
    vnode.el = domEl
    container.appendChild(domEl)
}

function mountChildren(vnode: any, container: any) {
    vnode.children.forEach(vnode => {
        patch(vnode, container)
    })
}

