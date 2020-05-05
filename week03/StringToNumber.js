function convertStringToNumber(string, x = 10) {
    let chars = string.split('')
    let number = 0
    let i = 0
    while (i < chars.length && chars[i] !== '.' && chars[i] !== 'e') {
        number = number * x
        number += chars[i].codePointAt(0) - '0'.codePointAt(0)
        i++
    }
    if (String(chars[i]) === '.') {
        i++
        let fraction = 1;
        while (i < chars.length && chars[i] !== 'e') {
            fraction = fraction / x
            number += (chars[i].codePointAt(0) - '0'.codePointAt(0)) * fraction
            i++
        }
    }
    if (String(chars[i]) === 'e') {
        i++
    }
    let e = x
    if (String(chars[i]) === '-') {
        i++
        e = 1 / x
    }
    let eNumber = 0
    while (i < chars.length) {
        eNumber = eNumber * e
        eNumber += chars[i].codePointAt(0) - '0'.codePointAt(0)
        i++
    }
    return number * e ** eNumber
}

console.log(convertStringToNumber('100.0123e-4'))
