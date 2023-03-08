
import { effect } from "../reactivity/effect";
import { EMPTY_OBJ, hasOwn } from "../shared";
import { ShapeFlags } from "../shared/ShapeFlag";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {
    const {
        createElement: hostCreateElement,
        patchProp: hostPatchProp,
        insert: hostInsert,
    } = options;

    function render(vnode, container) {
        patch(null, vnode, container, null)
    }

    function patch(n1, n2, container, parentComponent) {
        const { type, shapeFlag } = n2
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent)
                break
            case Text:
                processText(n1, n2, container, parentComponent)
                break
            default:
                //(0001|0101|1001)&0001 >0为true
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container, parentComponent)
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(n1, n2, container, parentComponent)
                }
                break
        }
    }
    function processText(n1, n2, container: any, parentComponent) {
        const element = (n2.el = document.createTextNode(n2.children))
        container.appendChild(element)
    }

    function processFragment(n1, n2, container: any, parentComponent) {
        mountChildren(n2, container, parentComponent)
    }

    function processElement(n1, n2, container: any, parentComponent) {
        if (!n1) {
            mountElement(n2, container, parentComponent)
        } else {
            patchElement(n1, n2, container)
        }
    }

    function patchElement(n1, n2, container) {
        console.log("patchElement")
        console.log('n1', n1)
        console.log('n2', n2)
        const el = (n2.el = n1.el)
        const oldProps = n1.props || EMPTY_OBJ
        const newProps = n2.props || EMPTY_OBJ
        patchProps(el, oldProps, newProps)
    }

    function patchProps(el, oldProps: any, newProps: any) {
        if (oldProps !== newProps) {
            for (let key in newProps) {
                let prevProp = oldProps[key]
                let newProp = newProps[key]
                if (prevProp !== newProp) {
                    hostPatchProp(el, key, prevProp, newProp)
                }
            }
            if (oldProps !== EMPTY_OBJ) {
                for (let key in oldProps) {
                    if (!hasOwn(newProps, key)) {
                        hostPatchProp(el, key, oldProps[key], null)
                    }
                }
            }
        }
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
            hostPatchProp(el, prop, null, props[prop])
        }

        hostInsert(el, container)
    }

    function mountChildren(vnode, container, parentComponent) {
        vnode.children.forEach((v) => {
            patch(null, v, container, parentComponent);
        });
    }

    function processComponent(n1, n2, container, parentComponent) {
        mountComponent(n2, container, parentComponent)
    }

    function mountComponent(initialVNode, container, parentComponent) {
        const instance = createComponentInstance(initialVNode, parentComponent)
        //先处理setup里面的数据，把setup放在this里面去
        setupComponent(instance)
        //处理render里面的数据，重新patch
        setupRenderEffect(instance, initialVNode, container)
    }

    function setupRenderEffect(instance: any, initialVNode, container) {
        effect(() => {
            if (!instance.isMounted) {
                console.log("init");
                const { proxy } = instance;
                const subTree = (instance.subTree = instance.render.call(proxy));

                patch(null, subTree, container, instance);

                initialVNode.el = subTree.el;

                instance.isMounted = true;
            } else {
                console.log("update");
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;

                patch(prevSubTree, subTree, container, instance);
            }
        });
    }
    return {
        createApp: createAppAPI(render)
    }

}


