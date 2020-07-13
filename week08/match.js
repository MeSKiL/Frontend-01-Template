function match(selector,element){
    let selectorList = selector.split(' ')
    return true
}
match("div #id.class",document.getElementById("id"))
