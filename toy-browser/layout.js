function getStyle(element) {
    if (!element.style) {
        element.style = {}
    }
    for (let prop in element.computedStyle) {
        let p = element.computedStyle.value
        element.style[prop] = element.computedStyle[prop].value
        if (element.style[prop].toString().match(/px$/)) {
            element.style[prop] = parseInt(element.style[prop])
        }
        if (element.style[prop].toString().match(/^[0-9\.]+$/)) {
            element.style[prop] = parseInt(element.style[prop])
        }
    }
    return element.style
}

function layout(element) {
    if (!element.computedStyle) {
        return
    }
    let elementStyle = getStyle(element)
    if (elementStyle.display !== 'flex') {
        return
    }
    // 子元素
    let items = element.children.filter(e => e.type === 'element')
    items.sort(function (a, b) {
        return (a.order || 0) - (b.order || 0)
    })
    let style = elementStyle
    ;['width', 'height'].forEach(size => {
        if (style[size] === 'auto' || style[size] === '') {
            style[size] = null
        }
    })
    if (!style.flexDirection || style.flexDirection === 'auto') {
        style.flexDirection = 'row'
    }
    if (!style.alignItems || style.alignItems === 'auto') {
        style.alignItems = 'stretch'
    }
    if (!style.justifyContent || style.justifyContent === 'auto') {
        style.justifyContent = 'flex-start'
    }
    if (!style.flexWrap || style.flexWrap === 'auto') {
        style.flexWrap = 'nowrap'
    }
    if (!style.alignContent || style.alignContent === 'auto') {
        style.alignContent = 'stretch'
    }
    let mainSize, mainStart, mainEnd, mainSign, mainBase, crossSize, crossStart, crossEnd, crossSign, crossBase
    if (style.flexDirection === 'row') {
        mainSize = 'width'
        mainStart = 'left'
        mainEnd = 'right'
        // 方向，从左往右就是+1,从右往左就是-1
        mainSign = +1
        // 起始位置
        mainBase = 0
        crossSize = 'height'
        crossStart = 'top'
        crossEnd = 'bottom'
    }
    if (style.flexDirection === 'row-reverse') {
        mainSize = 'width'
        mainStart = 'right'
        mainEnd = 'left'
        mainSign = -1
        mainBase = style.width
        crossSize = 'height'
        crossStart = 'top'
        crossEnd = 'bottom'
    }
    if (style.flexDirection === 'column') {
        mainSize = 'height'
        mainStart = 'top'
        mainEnd = 'bottom'
        mainSign = +1
        mainBase = 0
        crossSize = 'width'
        crossStart = 'left'
        crossEnd = 'right'
    }
    if (style.flexDirection === 'column-reverse') {
        mainSize = 'height'
        mainStart = 'bottom'
        mainEnd = 'top'
        mainSign = -1
        mainBase = style.height
        crossSize = 'width'
        crossStart = 'left'
        crossEnd = 'right'
    }
    // 修改交叉轴的表现
    if (style.flexWrap === 'wrap-reverse') {
        [crossStart, crossEnd] = [crossEnd, crossStart]
        crossSign = -1
    } else {
        crossBase = 0
        crossSign = 1
    }
    // 父元素没有设置mainSize就由子元素撑开
    let isAutoMainSize = false
    if (!style[mainSize]) {
        style[mainSize] = 0
        for (let i = 0; i < items.length; i++) {
            let item = items[i]
            let itemStyle = getStyle(item)
            if (itemStyle[mainSize]) {
                style[mainSize] += itemStyle[mainSize]
            }
        }
        isAutoMainSize = true
    }
    let flexLine = []
    let flexLines = [flexLine]
    let mainSpace = style[mainSize]
    let crossSpace = 0
    for (let i = 0; i < items.length; i++) {
        let item = items[i]
        let itemStyle = getStyle(item)
        if (itemStyle[mainSize] === null) {
            itemStyle[mainSize] = 0
        }
        // 如果子元素是flex的说明可伸缩，就一定在第一行
        if (itemStyle.flex) {
            flexLine.push(item)
        } else if (style.flexWrap === 'nowrap' || isAutoMainSize) {
            // 如果父元素的不换行的，或者大小是auto的，继续塞第一行
            mainSpace -= itemStyle[mainSize]
            if (itemStyle[crossSize]) {
                crossSpace = Math.max(crossSpace, itemStyle[crossSize])
            }
            flexLine.push(item)
        } else {
            // 如果item比父元素还要宽，就缩到一样宽
            if (itemStyle[mainSize] > style[mainSize]) {
                itemStyle[mainSize] = style[mainSize]
            }
            // 这一行的剩余空间小于item的大小，就给这一行收个尾，然后另起一行。
            if (mainSpace < itemStyle[mainSize]) {
                flexLine.mainSpace = mainSpace
                flexLine.crossSpace = crossSpace
                flexLine = [item]
                flexLines.push(flexLine)
                mainSpace = style[mainSize]
                crossSpace = 0
            } else {
                flexLine.push(item)
            }
            if (itemStyle[crossSize]) {
                crossSize = Math.max(crossSpace, itemStyle[crossSize])
            }
            mainSpace -= itemStyle[mainSize]
        }
    }
    // 结束以后flexLine的crossSpace和mainSpace需要设置
    flexLine.mainSpace = mainSpace
    if (style.flexWrap === 'nowrap' || isAutoMainSize) {
        flexLine.crossSpace = (style[crossSize] !== undefined) ? style[crossSize] : crossSpace
    } else {
        flexLine.crossSpace = crossSpace
    }
    if (mainSpace < 0) {
        // overflow的情况，只有nowrap会发生
        // mainSpace<0,所以scale<1
        let scale = style[mainSize] / (style[mainSize] - mainSpace)
        let currentMain = mainBase
        for (let i = 0; i < items.length; i++) {
            let item = items[i]
            let itemStyle = getStyle(item)
            // 如果overflow了，那么所有子元素的flex都设为0
            if (itemStyle.flex) {
                itemStyle[mainSize] = 0
            }
            // 缩放，子元素的起点为currentMain
            itemStyle[mainSize] *= scale
            itemStyle[mainStart] = currentMain
            itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize]
            currentMain = itemStyle[mainEnd]
        }
    } else {
        // 多行的情况的话
        flexLines.forEach(function (items) {
            let mainSpace = items.mainSpace
            let flexTotal = 0
            for (let i = 0; i < items.length; i++) {
                let item = items[i]
                let itemStyle = getStyle(item)
                if (itemStyle.flex) {
                    flexTotal += itemStyle.flex
                }
            }
            if (flexTotal > 0) {
                // 存在flex的元素,就瓜分剩余空间
                let currentMain = mainBase
                for (let i = 0; i < items.length; i++) {
                    let item = items[i]
                    let itemStyle = getStyle(item)
                    if (itemStyle.flex) {
                        itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex
                    }
                    itemStyle[mainStart] = currentMain
                    itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize]
                    currentMain = itemStyle[mainEnd]
                }
            } else {
                let currentMain, step
                // 没有flex元素,justifyContent就发挥作用了
                if (style.justifyContent === 'flex-start') {
                    currentMain = mainBase
                    step = 0
                }
                if (style.justifyContent === 'flex-end') {
                    // 从mainBase+空白开始
                    currentMain = mainSpace * mainSign + mainBase
                    step = 0
                }
                if (style.justifyContent === 'center') {
                    currentMain = mainSpace / 2 * mainSpace + mainBase
                    step = 0
                }
                if (style.justifyContent === 'space-between') {
                    currentMain = mainBase
                    step = mainSpace / (items.length - 1) * mainSign
                }
                if (style.justifyContent === 'space-around') {
                    step = mainSpace / items.length * mainSign
                    currentMain = step / 2 + mainBase
                }
                for (let i = 0; i < items.length; i++) {
                    let item = items[i]
                    let itemStyle = getStyle(item)
                    itemStyle[mainStart] = currentMain
                    itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize]
                    currentMain = itemStyle[mainEnd] + step
                }
            }
        })
    }
    if (!style[crossSize]) {
        // 父元素没有高度
        crossSpace = 0
        style[crossSize] = 0
        for (let i = 0; i < flexLines.length; i++) {
            style[crossSize] = style[crossSize] + flexLines[i].crossSpace
        }
    } else {
        crossSpace = style[crossSize]
        for (let i = 0; i < flexLines.length; i++) {
            crossSpace -= flexLines[i].crossSpace
        }
    }
    if (style.flexWrap === 'wrap-reverse') {
        crossBase = style[crossSize]
    } else {
        crossBase = 0
    }
    let lineSize = style[crossSize] / flexLines.length
    let step
    if (style.alignContent === 'flex-start') {
        crossBase += 0
        step = 0
    }
    if (style.alignContent === 'flex-end') {
        crossBase += crossSign * crossSpace
        step = 0
    }
    if (style.alignContent === 'center') {
        crossBase += crossSign * crossSpace / 2
        step = 0
    }
    if (style.alignContent === 'space-between') {
        crossBase += 0
        step = crossSpace / (flexLines.length - 1)
    }
    if (style.alignContent === 'space-around') {
        step = crossSpace / (flexLines.length)
        crossBase += crossSign * step / 2
    }
    if (style.alignContent === 'stretch') {
        crossBase += 0
        step = 0
    }
    flexLines.forEach((items) => {
        let lineCrossSize = style.alignContent === 'stretch' ? items.crossSpace + crossSpace / flexLines.length : items.crossSpace
        for (let i = 0; i < items.length; i++) {
            let item = items[i]
            let itemStyle = getStyle(item)
            let align = itemStyle.alignSelf || style.alignItems
            if (itemStyle[crossSize] === null) {
                itemStyle[crossSize] = (align === 'stretch') ? lineCrossSize : 0
            }
            if (align === 'flex-start') {
                itemStyle[crossStart] = crossBase
                itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize]
            }
            if (align === 'flex-end') {
                itemStyle[crossEnd] = crossBase + crossSign * lineCrossSize
                itemStyle[crossStart] = itemStyle[crossEnd] - crossSign * itemStyle[crossSize]
            }
            if (align === 'center') {
                itemStyle[crossStart] = crossBase + crossSign * (lineCrossSize - itemStyle[crossSize]) / 2
                itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize]
            }
            if (align === 'stretch') {
                itemStyle[crossStart] = crossBase
                itemStyle[crossEnd] = crossBase + crossSign * ((itemStyle[crossSize] || lineCrossSize))
                itemStyle[crossSize] = crossSign * (itemStyle[crossEnd] - itemStyle[crossStart])
            }
        }
        crossBase += crossSign * (lineCrossSize + step)
    })
    console.log(items)
}

module.exports = layout
