import { h } from '../../lib/guide-mini-vue.esm.js'

window.self = null
export default {
    render() {
        window.self = this
        console.log(this)
        return h('div', {
            onClick() {
                console.log('click+32993')
            },
            onMousedown() {
                console.log('mousedown')
            },
        },
            "hi," + this.title)
        // [h("p", { class: 'red' }, "hi"), h("p", { class: 'blue' }, 'mini-vue')])
    },
    setup() {
        return {
            title: 'mini-vue',
        }
    },
}