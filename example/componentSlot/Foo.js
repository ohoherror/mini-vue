import { h, renderSlots } from '../../lib/guide-mini-vue.esm.js'

export const Foo = {
    name: "Foo",
    setup() { },
    render() {
        const foo = h('p', {}, 'foo')
        console.log(this.$slots)
        const count = 333
        return h('div', {}, [renderSlots(this.$slots, 'header', { count: count }), foo, renderSlots(this.$slots, "footer")])
    },
}