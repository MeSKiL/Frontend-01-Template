// 数字直接量正则表达式
let HexDigit = /^[\da-fA-F]$/
let HexDigits = /^[\da-fA-F]+$/
let HexIntegerLiteral = /^0[xX][\da-fA-F]+$/

let OctalDigit = /^[0-7]$/
let OctalDigits = /^[0-7]+$/
let OctalIntegerLiteral = /^0[oO][0-7]+$/

let BinaryDigit = /^[0-1]$/
let BinaryDigits = /^[0-1]+$/
let BinaryIntegerLiteral = /^0[bB][0-1]+$/

let SignedInteger = /^[+-]?\d+$/
let ExponentIndicator = /^[eE]$/
let ExponentPart = /^[eE][+-]?\d+$/

let NonZeroDigit = /^[1-9]$/

let DecimalDigit = /^\d$/
let DecimalDigits = /^\d+$/

let DecimalIntegerLiteral = /^(0|[1-9]\d*)$/

let DecimalLiteral = /^(((0|[1-9]\d*)(\.\d*)?([eE][+-]?\d+)?)|(\.\d+([eE][+-]?\d+)?))$/

let NumericLiteral =  /^((((0|[1-9]\d*)(\.\d*)?([eE][+-]?\d+)?)|(\.\d+([eE][+-]?\d+)?))|(0[bB][0-1]+)|(0[oO][0-7]+)|(0[xX][\da-fA-F]+))$/
