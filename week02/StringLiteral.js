let Hex4Digits = /^[\da-fA-F]{4}$/
let codePoint = /^(10|0?[\da-fA-F])[\da-fA-F]{0,4}$/

// todo 0?0*
let UnicodeEscapeSequence = /^u([\da-fA-F]{4}|(\{(10|0?[\da-fA-F])[\da-fA-F]{0,4}\}))$/
let HexEscapeSequence = /^x[\da-fA-F]{2}$/

// 转义字符
let EscapeCharacter = /^['"\\bfnrtv\dxu]$/
// 单个转义字符
let SingleEscapeCharacter = /^'"\\bfnrtv$/
let SourceCharacter = /^\u{0}-\u{10FFFF}$/
let LineTerminator = /^[\n\r\u2028\u2029]$/

// 非转义字符u
let NonEscapeCharacter = /^[^'"\\bfnrtv\dxu\n\r\u2028\u2029]$/u

let CharacterEscapeSequence = /^[^\dxu\n\r\u2028\u2029]$/u

let EscapeSequence = /^([^\dxu\r]|0(?!\d)|x[\da-fA-F]{2}|u([\da-fA-F]{4}|(\{(10|0?[\da-fA-F])[\da-fA-F]{0,4}\})))$/u

let LineTerminatorSequence = /^[\n\u2028\u2029]|(\r\n?)$/u
let LineContinuation = /^\\(\r\n?)$/u

let SingleStringCharacter = /^(([^'\\\n\r])|(\\(\r\n|[^\dxu]|0(?!\d)|x[\da-fA-F]{2}|(u([\da-fA-F]{4}|(\{(10|0?[\da-fA-F])[\da-fA-F]{0,4}\}))))))$/u
let DoubleStringCharacter = /^(([^"\\\n\r])|(\\(\r\n|[^\dxu]|0(?!\d)|x[\da-fA-F]{2}|(u([\da-fA-F]{4}|(\{(10|0?[\da-fA-F])[\da-fA-F]{0,4}\}))))))$/u

let SingleStringCharacters = /^(([^'\\\n\r])|(\\(\r\n|[^\dxu]|0(?!\d)|x[\da-fA-F]{2}|(u([\da-fA-F]{4}|(\{(10|0?[\da-fA-F])[\da-fA-F]{0,4}\}))))))+$/u
let DoubleStringCharacters = /^(([^"\\\n\r])|(\\(\r\n|[^\dxu]|0(?!\d)|x[\da-fA-F]{2}|(u([\da-fA-F]{4}|(\{(10|0?[\da-fA-F])[\da-fA-F]{0,4}\}))))))+$/u

let StringLiteral = /^('((([^'\\\n\r])|(\\(\r\n|[^\dxu]|0(?!\d)|x[\da-fA-F]{2}|(u([\da-fA-F]{4}|(\{(10|0?[\da-fA-F])[\da-fA-F]{0,4}\}))))))*)'|"((([^"\\\n\r])|(\\(\r\n|[^\dxu]|0(?!\d)|x[\da-fA-F]{2}|(u([\da-fA-F]{4}|(\{(10|0?[\da-fA-F])[\da-fA-F]{0,4}\}))))))*)")$/u
