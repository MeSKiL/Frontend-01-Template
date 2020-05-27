// 广度优先遍历
const globalProperties = [
    "Infinity",
    "NaN",
    "undefined",
    "eval",
    "isFinite",
    "isNaN",
    "parseFloat",
    "parseInt",
    "decodeURI",
    "encodeURI",
    "decodeURIComponent",
    "encodeURIComponent",
    "Array",
    "ArrayBuffer",
    "Boolean",
    "DataView",
    "Date",
    "Error",
    "EvalError",
    "Float32Array",
    "Float64Array",
    "Function",
    "Int8Array",
    "Int16Array",
    "Int32Array",
    "Map",
    "Number",
    "Object",
    "Promise",
    "Proxy",
    "RangeError",
    "ReferenceError",
    "RegExp",
    "Set",
    "SharedArrayBuffer",
    "String",
    "Symbol",
    "SyntaxError",
    "TypeError",
    "Uint8Array",
    "Uint8ClampedArray",
    "Uint16Array",
    "Uint32Array",
    "URIError",
    "WeakMap",
    "WeakSet",
    "Atomics",
    "JSON",
    "Math",
    "Reflect"
]
let queue = []
for(let p of globalProperties){
    queue.push({
        path:[p],
        object:this[p]
    })
}
let set = new Set()
let current
while (queue.length){
    current = queue.shift()
    console.log(current.path.join('.'))
    if(current.object===undefined){
        set.add(current.object)
        continue
    }
    if(set.has(current.object)){
        continue
    }
    set.add(current.object)
    for(let p of Object.getOwnPropertyNames(current.object)){
        let property = Object.getOwnPropertyDescriptor(current.object,p)
        if(
            property.hasOwnProperty('value') &&
            (property.value!==null && typeof property.value==='object' || typeof property.value =='function') &&
            property.value instanceof Object
        ){
            queue.push({
                path:current.path.concat([p]),
                object: property.value
            })
        }
        if(property.hasOwnProperty('get') && typeof property.get==='function' ){
            queue.push({
                path:current.path.concat([p]),
                object: property.get
            })
        }
    }
}
