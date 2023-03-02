import { h } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";

export const App = {
    name: "App",
    render() {
        const app = h('div', {}, "App")
        const foo = h(Foo, {}, h('p', {}, '124'))
        // 我们在渲染一个组件的时候，向第 3 个函数挂载 h
        return h('div', {}, [app, foo])
    },
    setup() { },
};