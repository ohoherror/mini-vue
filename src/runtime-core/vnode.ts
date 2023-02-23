import { ShapeFlags } from "../shared/ShapeFlag"

export function createVNode(type, props?, children?) {
    const vnode = {
        type,
        props,
        children,
        $el: null,
        shapeFlags: getShapeFlags(type),
    }
    if (typeof children === 'string') {
        //要添加或逻辑，因为要走ShapeFlags.ELEMENT的逻辑，继续绘制dom
        vnode.shapeFlags |= ShapeFlags.TEXT_CHILDREN //0001|0100->0101
    } else if (Array.isArray(children)) {
        vnode.shapeFlags |= ShapeFlags.ARRAY_CHILDREN
    }
    return vnode
}

function getShapeFlags(type) {
    return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}