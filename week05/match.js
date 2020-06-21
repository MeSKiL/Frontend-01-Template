// 状态机
function match(str) {
    let state = start
    for(let p of str){
        state = state(p)
    }
    return state === end
}
function start(c){
    if(c==='a'){
        return foundA
    }else{
        return start
    }
}
function foundA(c) {
    if(c==='b'){
        return foundB
    }else{
        return start(c)
    }
}
function foundB(c) {
    if(c==='c'){
        return end
    }else {
        return start(c)
    }
}
function end() {
    return end
}
console.log(match('aacbc'))
