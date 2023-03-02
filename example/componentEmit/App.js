import { h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'

window.self = null
export default {
    name: "APP",
    render() {
        window.self = this
        return h('div', {}, [h('p', {}, 'hello'), h(Foo, { onAdd: this.onAdd })])
    },
    setup() {
        function onAdd(...e) {
            console.log("onAdd")
            console.log(e)
        }
        return {
            title: 'mini-vue',
            onAdd
        }
    },
}