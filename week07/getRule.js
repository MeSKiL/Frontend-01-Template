// https://www.w3.org/TR/?tag=css
const getRules = () => {
    return Array.from(document.querySelectorAll('#container [data-tag*=css]')).map(item => {
        return {
            name: item.children[1].innerText,
            url: item.children[1].children[0].href
        }
    })
}

function happen(element, event) {
    return new Promise((resolve, reject) => {
        let handler = () => {
            resolve()
            element.removeEventListener(event, handler)
        }
        element.addEventListener(event, handler)
    })
}

const getCssRules = async () => {
    let rules = getRules()
    let iframe = document.createElement('iframe')
    document.body.innerHTML = ''
    document.body.appendChild(iframe)
    for (let standard of rules) {
        iframe.src = standard.url
        console.log(standard.name)
        await happen(iframe, 'load')
    }
}
getCssRules()
