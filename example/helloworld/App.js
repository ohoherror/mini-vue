import { h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'

window.self = null
export default {
    name: "APP",
    render() {
        window.self = this
        console.log(this)
        // return h('div', {
        //     onClick() {
        //         console.log('click+32993')
        //     },
        //     onMousedown() {
        //         console.log('mousedown')
        //     },
        // },
        //     "hi," + this.title)
        return h("div", {}, [h(Foo, { count: 1 })])
    },
    setup() {
        return {
            title: 'mini-vue',
        }
    },
}