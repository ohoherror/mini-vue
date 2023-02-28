import { initProps } from "./componentProps"
import { PublicInstanceProxyHandles } from "./componentPublicInstance"

export function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {}
    }
    return component
}

export function setupComponent(instance, container) {
    initProps(instance, instance.vnode.props)
    setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: any) {
    const component = instance.type
    const { setup } = component
    if (setup) {
        const setupResult = setup()
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



