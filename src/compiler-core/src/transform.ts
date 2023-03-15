export const transform = (root, options) => {
    const context = createTransformContext(root, options)
    // 然后将这个上下文传入 traverseNode 中
    traverseNode(root, context)
}

function traverseNode(node, context) {
    let { nodeTransforms } = context
    for (let i = 0; i < nodeTransforms.length; i++) {
        nodeTransforms[i](node)
    }
    traverseChildren(node, context)
}

function createTransformContext(root: any, options: any) {
    return {
        root,
        nodeTransforms: options.nodeTransforms || {},
    }
}
function traverseChildren(node: any, context: any) {
    const children = node.children
    if (children) {
        for (let i = 0; i < children.length; i++) {
            traverseNode(children[i], context)
        }
    }
}

