import { h } from '../../lib/guide-mini-vue.esm.js'
export default {
    render() {
        console.log(this)
        return h('div', { id: "root", class: ['red', 'hard'] },
            "hi," + this.title)
        // [h("p", { class: 'red' }, "hi"), h("p", { class: 'blue' }, 'mini-vue')])
    },
    setup() {
        return {
            title: 'mini-vue',
        }
    },
}