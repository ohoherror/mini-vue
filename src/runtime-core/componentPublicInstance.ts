const publicPropertiesMap = {
    $el: (i) => i.vnode.$el
}

export const PublicInstanceProxyHandles = {
    get({ _: instance }, key) {
        const { setupState } = instance
        if (key in setupState) {
            return instance.setupState[key]
        }
        const publicGetter = publicPropertiesMap[key]
        if (publicGetter) {
            return publicGetter(instance.vnode)
        }
    }
}