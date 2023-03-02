import { h } from '../../lib/guide-mini-vue.esm.js'

export const Foo = {
    name: "Foo",
    setup(props, { emit }) {
        const handleClick = () => {
            emit('add', 1)
        }

        return { handleClick }
    },
    render() {
        return h('button', {
            onClick: this.handleClick
        }, '点击我' + this.count)
    }
}