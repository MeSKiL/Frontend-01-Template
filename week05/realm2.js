// 深度优先遍历
const globalProperties = [
    'Infinity',
    'NaN',
    'undefined',
    'eval',
    'isFinite',
    'isNaN',
    'parseFloat',
    'parseInt',
    'decodeURI',
    'encodeURI',
    'decodeURIComponent',
    'encodeURIComponent',
    'Array',
    'ArrayBuffer',
    'Boolean',
    'DataView',
    'Date',
    'Error',
    'EvalError',
    'Float32Array',
    'Float64Array',
    'Function',
    'Int8Array',
    'Int16Array',
    'Int32Array',
    'Map',
    'Number',
    'Object',
    'Promise',
    'Proxy',
    'RangeError',
    'ReferenceError',
    'RegExp',
    'Set',
    'SharedArrayBuffer',
    'String',
    'Symbol',
    'SyntaxError',
    'TypeError',
    'Uint8Array',
    'Uint8ClampedArray',
    'Uint16Array',
    'Uint32Array',
    'URIError',
    'WeakMap',
    'WeakSet',
    'Atomics',
    'JSON',
    'Math',
    'Reflect'
]
let queue = []
for (let p of globalProperties) {
    queue.push({
        path: [p],
        object: this[p]
    })
}
let set = new Set()
let content
let basePath
const findContentPrototype = (obj) => {
    console.log(basePath.join('.'))
    if(typeof obj === 'object' || typeof obj === 'function'){
        for (let p of Object.getOwnPropertyNames(obj)) {
            let property = Object.getOwnPropertyDescriptor(obj, p)
            if (
                property.hasOwnProperty('value') &&
                (property.value !== null && typeof property.value === 'object' || typeof property.value == 'function') &&
                property.value instanceof Object
            ) {
                if(set.has(property.value)){
                    console.log(`${basePath.join('.')}.${p}`)
                    continue
                }
                set.add(property.value)
                basePath.push(p)
                findContentPrototype(property.value)
                basePath.pop()
            }
            if (property.hasOwnProperty('get') && typeof property.get === 'function') {
                if(set.has(property.get)){
                    console.log(`${basePath.join('.')}.${p}`)
                    continue
                }
                set.add(property.get)
                basePath.push(p)
                findContentPrototype(property.get)
                basePath.pop()
            }
        }
    }else{
        set.add(obj)
    }
}
while (queue.length) {
    content = queue.shift()
    set.add(content.object)
    basePath = content.path
    findContentPrototype(content.object)
}
