import { h } from '../../lib/guide-mini-vue.esm.js'

export const Foo = {
    name: "Foo",
    setup() { },
    render() {
        const foo = h('p', {}, 'foo')
        console.log(this.$slots)
        return h('div', {}, [foo])
    },
}