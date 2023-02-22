import { h } from '../../lib/guide-mini-vue.esm.js'
export default {
    render() {
        return h('div', 'hi ' + this.title)
    },
    setup() {
        return {
            title: 'mini-vue',
        }
    },
}