import { ShapeFlags } from "../shared/ShapeFlag"

export const initSlots = (instance, children) => {
    const { vnode } = instance
    if (vnode.shapeFlags & ShapeFlags.SLOT_CHILDREN) {
        normalizeObjectSlots(children, instance.slots)
    }
}

function normalizeObjectSlots(children: any, slots: any) {
    for (const key in children) {
        const value = children[key]
        slots[key] = (props) => normalizeSlotValue(value(props))
    }
}

function normalizeSlotValue(value: any): any {
    return Array.isArray(value) ? value : [value]
}
