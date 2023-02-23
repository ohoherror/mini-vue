export function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type
    }
    return component
}

export function setupComponent(instance, container) {
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
    instance.proxy = new Proxy({}, {
        //key是render里面调用的key
        get(target, key) {
            if (key in instance.setupState) {
                return instance.setupState[key]
            }
        }
    })
    instance.render = component.render
}



