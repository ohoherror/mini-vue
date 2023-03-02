import { shallowReadonly } from "../reactivity/reactive"
import { initProps } from "./componentProps"
import { PublicInstanceProxyHandles } from "./componentPublicInstance"
import { emit } from "./compontProps"

export function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        emit: () => { }
    }
    component.emit = emit.bind(null, component) as any
    return component
}

export function setupComponent(instance, container) {
    //初始化props
    initProps(instance, instance.vnode.props)
    setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: any) {
    const component = instance.type
    const { setup } = component
    if (setup) {
        const setupResult = setup(shallowReadonly(instance.props), { emit: instance.emit })
        handleSetupResult(instance, setupResult)
    }
}

function handleSetupResult(instance: any, setupResult: any) {
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult
    }
    finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
    const component = instance.type
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandles)
    instance.render = component.render
}



