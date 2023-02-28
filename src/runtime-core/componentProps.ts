import { shallowReadonly } from "../reactivity/reactive"

export const initProps = (instance, props) => {
    instance.props = shallowReadonly(props || {})
}