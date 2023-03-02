
export const emit = (instance, event, ...arg) => {
    // console.log(event)
    // console.log(instance.props)
    // instance.props.onAdd = instance.props?.onAdd.apply(null, arg)
    instance.props.onAdd && instance.props.onAdd(...arg)
}