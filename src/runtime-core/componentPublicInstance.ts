const publicPropertiesMap = {
    $el: (i) => i.vnode.$el
}

export const PublicInstanceProxyHandles = {
    get({ _: instance }, key) {
        const { setupState, props } = instance
        if (key in setupState) {
            return instance.setupState[key]
        } else if (key in props) {
            return instance.props[key]
        }
        const publicGetter = publicPropertiesMap[key]
        if (publicGetter) {
            return publicGetter(instance.vnode)
        }
    }
}