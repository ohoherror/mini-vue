
import { ShapeFlags } from "../shared/ShapeFlag"
import { createComponentInstance, setupComponent } from "./component"
import { createAppAPI } from "./createApp"
import { Fragment, Text } from "./vnode"
import { effect } from "../reactivity/effect";

export function createRenderer(options) {
    const {
        createElement: hostCreateElement,
        patchProp: hostPatchProp,
        insert: hostInsert,
    } = options;

    function render(vnode, container) {
        patch(vnode, container, null)
    }

    function patch(vnode, container, parentComponent) {
        const { type, shapeFlag } = vnode
        switch (type) {
            case Fragment:
                processFragment(vnode, container, parentComponent)
                break
            case Text:
                processText(vnode, container, parentComponent)
                break
            default:
                //(0001|0101|1001)&0001 >0为true
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(vnode, container, parentComponent)
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(vnode, container, parentComponent)
                }
                break
        }
    }
    function processText(vnode: any, container: any, parentComponent) {
        const element = (vnode.el = document.createTextNode(vnode.children))
        container.appendChild(element)
    }

    function processFragment(vnode: any, container: any, parentComponent) {
        mountChildren(vnode, container, parentComponent)
    }

    function processElement(vnode: any, container: any, parentComponent) {
        mountElement(vnode, container, parentComponent)
    }

    function mountElement(vnode: any, container: any, parentComponent) {
        //type里面放标签名，如：div,button等
        //props里面放样式、事件等
        //children里面放内容
        //此时的shapeFlags只有字符串类型或数组类型
        const el = (vnode.el = hostCreateElement(vnode.type));
        const { children, shapeFlag } = vnode;
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = children
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(vnode, el, parentComponent)
        }
        const { props } = vnode;
        for (const prop in props) {
            hostPatchProp(el, prop, props)
        }

        hostInsert(el, container)
    }


    function mountChildren(vnode: any, container: any, parentComponent) {
        vnode.children.forEach((v) => {
            patch(v, container, parentComponent);
        });
    }

    function processComponent(vnode, container, parentComponent) {
        mountComponent(vnode, container, parentComponent)
    }

    function mountComponent(initialVNode, container, parentComponent) {
        const instance = createComponentInstance(initialVNode, parentComponent)
        //先处理setup里面的数据，把setup放在this里面去
        setupComponent(instance)
        //处理render里面的数据，重新patch
        setupRenderEffect(instance, initialVNode, container)
    }

    function setupRenderEffect(instance, initialVNode, container) {
        //this指向setup里面的对象
        effect(() => {
            console.log("init");
            const { proxy } = instance;
            const subTree = (instance.subTree = instance.render.call(proxy));

            patch(subTree, container, instance);

            initialVNode.el = subTree.el;

            instance.isMounted = true;

        })

    }

    return {
        createApp: createAppAPI(render)
    }

}
