import { camelize, toHandlerKey } from "../shared/index"

export const emit = (instance, event, ...arg) => {
    const { props } = instance

    const handle = props[toHandlerKey(camelize(event))]
    handle && handle(...arg)
}