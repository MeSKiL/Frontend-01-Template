export const RENDER_TO_DOM = Symbol('render to dom')

function isObject(object) {
    return !(object === null || typeof object !== 'object')
}

export class Component {
    constructor() {
        this.props = Object.create(null)
        this.children = []
        this._range = null
    }

    setAttribute(name, value) {
        this.props[name] = value
    }

    appendChild(component) {
        this.children.push(component)
    }

    get vdom() {
        return this.render().vdom
    }

    [RENDER_TO_DOM](range) {
        this._range = range
        this._vdom = this.vdom
        this._vdom[RENDER_TO_DOM](range)
    }

    update() {
        let isSameNode = (oldNode, newNode) => {
            if (
                oldNode.type !== newNode.type ||
                newNode.type === '#text' && newNode.content !== oldNode.content ||
                Object.keys(oldNode.props).length > Object.keys(newNode.props).length
            ) {
                return false
            }
            for (let name in newNode.props) {
                if (newNode.props[name] !== oldNode.props[name]) {
                    return false
                }
            }
            return true
        }
        let update = (oldNode, newNode) => {
            if (!isSameNode(oldNode, newNode)) {
                newNode[RENDER_TO_DOM](oldNode._range)
                return
            }
            newNode._range = oldNode._range
            let newChildren = newNode.vchildren
            let oldChildren = oldNode.vchildren
            if (!newChildren || !newChildren.length) {
                return
            }
            let tailRange = oldChildren[oldChildren.length - 1]._range
            for (let i = 0; i < newChildren.length; i++) {
                let newChild = newChildren[i]
                let oldChild = oldChildren[i]
                if (i < oldChildren.length) {
                    update(oldChild, newChild)
                } else {
                    let range = document.createRange()
                    range.setStart(tailRange.endContainer, tailRange.endOffset)
                    range.setEnd(tailRange.endContainer, tailRange.endOffset)
                    newChild[RENDER_TO_DOM](range)
                    tailRange = range
                }
            }
        }
        let vdom = this.vdom
        update(this._vdom, vdom)
        this._vdom = vdom
    }

    setState(newState) {
        if (!isObject(this.state)) {
            this.state = newState
        } else {
            let merge = (oldState, newState) => {
                for (let p in newState) {
                    if (!isObject(oldState[p]) || !isObject(newState[p])) {
                        oldState[p] = newState[p]
                    } else {
                        merge(oldState[p], newState[p])
                    }
                }
            }
            merge(this.state, newState)
        }
        this.update()
    }
}


class ElementWrapper extends Component {
    constructor(type) {
        // 实体dom
        super(type)
        this.type = type
    }

    get vdom() {
        // todo
        this.vchildren = this.children.map(child => child.vdom)
        return this
    }

    [RENDER_TO_DOM](range) {
        this._range = range
        let root = document.createElement(this.type)
        for (let name in this.props) {
            let value = this.props[name]
            if (name.match(/^on([\s\S]+)$/)) {
                // 确保小写开头
                root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase()), value)
            } else {
                if (name === 'className') {
                    root.setAttribute('class', value)
                } else {
                    root.setAttribute(name, value)
                }
            }
        }
        if (!this.vchildren) {
            this.vchildren = this.children.map(child => child.vdom)
        }
        for (let child of this.vchildren) {
            let childRange = document.createRange()
            childRange.setStart(root, root.childNodes.length)
            childRange.setEnd(root, root.childNodes.length)
            child[RENDER_TO_DOM](childRange)
        }
        replaceContent(range, root)
    }
}

class TextWrapper extends Component {
    constructor(content) {
        super(content)
        this.content = content
        this.type = '#text'
    }

    get vdom() {
        return this
    }

    [RENDER_TO_DOM](range) {
        let root = document.createTextNode(this.content)
        this._range = range
        replaceContent(range, root)
    }
}

function replaceContent(range, node) {
    range.insertNode(node)
    range.setStartAfter(node)
    range.deleteContents()
    range.setStartBefore(node)
    range.setEndAfter(node)
}

export function createElement(type, attributes, ...children) {
    let e
    if (typeof type === 'string') {
        e = new ElementWrapper(type)
    } else {
        // type是自定义class的时候
        e = new type
    }
    for (let p in attributes) {
        e.setAttribute(p, attributes[p])
    }
    // 深度优先遍历递归插入子节点
    let insertChildren = (children) => {
        for (let child of children) {
            if (typeof child === 'string') {
                child = new TextWrapper(child)
            }
            if (child === null) {
                continue
            }
            if ((typeof child === 'object') && (child instanceof Array)) {
                insertChildren(child)
            } else {
                e.appendChild(child)
            }
        }
    }
    insertChildren(children)
    return e
}

export function render(component, parentElement) {
    let range = document.createRange()
    range.setStart(parentElement, 0)
    range.setEnd(parentElement, parentElement.childNodes.length)
    range.deleteContents()
    component[RENDER_TO_DOM](range)
}
