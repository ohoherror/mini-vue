// import { render } from "./renderer"
import { createVNode } from "./vnode"

export function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                const vnode = createVNode(rootComponent)
                // vnode ={  type,   props,  children}
                render(vnode, document.querySelector(rootContainer))
            }
        }
    }
}
