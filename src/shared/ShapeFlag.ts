// export const ShapeFlag = {
//     isElement: (vnode) => typeof vnode.type === 'string',
//     isComponent: (vnode) => typeof vnode.type !== 'string',
//     isElementChildren: (children) => typeof children === 'string',
//     isElementArray: (children) => Array.isArray(children)
// }

export const ShapeFlags = {
    ELEMENT: 1,
    STATEFUL_COMPONENT: 1 << 1,//0010
    TEXT_CHILDREN: 1 << 2,//0100
    ARRAY_CHILDREN: 1 << 3,//1000
}