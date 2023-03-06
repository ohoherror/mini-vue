import { createVNode, Fragment } from "../vnode"

export const renderSlots = (slots, key, props) => {
    let slot = slots[key]
    if (slot) {
        if (typeof slot === 'function') {
            return createVNode(Fragment, {}, slot(props))
        }
    }

}