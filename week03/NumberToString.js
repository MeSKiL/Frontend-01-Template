function convertNumberToString(number, x = 10) {
    let integer = Math.floor(number)
    let fraction = number - Math.floor(number)
    let string = ''
    while (integer > 0) {
        string = String(integer % x) + string
        integer = Math.floor(integer / x)
    }
    if (fraction > 0) {
        string += '.'
    }
    let i = 0
    while (fraction > 0 && i < 15) {
        fraction = fraction * x
        string += Math.floor(fraction)
        fraction = fraction - Math.floor(fraction)
        i++
    }
    return string
}

console.log(convertNumberToString(12.91))
