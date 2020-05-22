const net = require('net')

// http是文本协议
type RequestType = 'get' | 'GET' | 'post' | 'POST' | 'put' | 'PUT' | 'delete' | 'DELETE'

interface IRequest {
    method: RequestType
    path: string
    host: string
    port: number
    body: any
    headers: any
    bodyText: string
    send: (body: any) => void
}

type OptionsType = {
    method?: RequestType
    path?: string
    host?: string
    port?: number
    body?: any
    headers?: any
}

class ToyRequest implements IRequest {
    method: RequestType
    path: string
    host: string
    port: number
    body: any
    headers: any
    bodyText: string

    constructor(options: OptionsType) {
        this.method = options.method || 'GET'
        this.path = options.path || '/'
        this.host = options.host
        this.port = options.port || 80
        this.body = options.body || {}
        this.headers = options.headers || {}
        if (!this.headers['Content-Type']) {
            this.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        }
        if (this.headers['Content-Type'] === 'application/json') {
            this.bodyText = JSON.stringify(this.body)
        } else if (this.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
            this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&')
        }
        this.headers['Content-Length'] = this.bodyText.length
    }

    toString() {
        return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}
\r
${this.bodyText}
`
    }

    send(connection?) {
        return new Promise((resolve, reject) => {
            const parser = new ResponseParser()
            if (connection) {
                connection.write(this.toString())
            } else {
                connection = net.createConnection({
                    host: this.host,
                    port: this.port
                }, () => {
                    connection.write(this.toString())
                })
            }
            connection.on('data', (data) => {
                parser.receive(data.toString())
                if (parser.isFinished) {
                    resolve(parser.response)
                    connection.end()
                }
                // resolve(data.toString())
            })
            connection.on('error', (err) => {
                reject(err);
                connection.end()
            })
        })
    }
}

class ToyResponse {

}

enum ParserStatus {
    WAITING_STATUS_LINE,
    WAITING_STATUS_LINE_END,
    WAITING_HEADER_NAME,
    WAITING_HEADER_SPACE,
    WAITING_HEADER_VALUE,
    WAITING_HEADER_LINE_END,
    WAITING_HEADER_BLOCK_END,
    WAITING_BODY
}

class ResponseParser {
    current: number
    statusLine: string
    headers: any
    headerName: string
    headerValue: string
    bodyParser: TrunkedBodyParser

    constructor() {
        this.current = ParserStatus.WAITING_STATUS_LINE
        this.statusLine = ''
        this.headers = {}
        this.headerName = ''
        this.headerValue = ''
    }

    get isFinished() {
        return this.bodyParser && this.bodyParser.isFinished
    }

    get response() {
        this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([^\r\n]+)/)
        return {
            statusCode: RegExp.$1,
            statusText: RegExp.$2,
            headers: this.headers,
            body: this.bodyParser.content.join('')
        }
    }

    receive(string) {
        for (let i = 0; i < string.length; i++) {
            this.receiveChar(string.charAt(i))
        }
    }

    receiveChar(char) {
        if (this.current === ParserStatus.WAITING_STATUS_LINE) {
            if (char === '\r') {
                this.current = ParserStatus.WAITING_STATUS_LINE_END
            }
            if (char === '\n') {
                this.current = ParserStatus.WAITING_HEADER_NAME
            } else {
                this.statusLine += char
            }
        } else if (this.current === ParserStatus.WAITING_STATUS_LINE_END) {
            if (char === '\n') {
                this.current = ParserStatus.WAITING_HEADER_NAME
            }
        } else if (this.current === ParserStatus.WAITING_HEADER_NAME) {
            if (char === ':') {
                this.current = ParserStatus.WAITING_HEADER_SPACE
            } else if (char === '\r') {
                this.current = ParserStatus.WAITING_HEADER_BLOCK_END
                if (this.headers['Transfer-Encoding'] === 'chunked') {
                    this.bodyParser = new TrunkedBodyParser()
                }
            } else {
                this.headerName += char
            }
        } else if (this.current === ParserStatus.WAITING_HEADER_SPACE) {
            if (char === ' ') {
                this.current = ParserStatus.WAITING_HEADER_VALUE
            }
        } else if (this.current === ParserStatus.WAITING_HEADER_VALUE) {
            if (char === '\r') {
                this.current = ParserStatus.WAITING_HEADER_LINE_END
                this.headers[this.headerName] = this.headerValue
                this.headerName = ''
                this.headerValue = ''
            } else {
                this.headerValue += char
            }
        } else if (this.current === ParserStatus.WAITING_HEADER_LINE_END) {
            if (char === '\n') {
                this.current = ParserStatus.WAITING_HEADER_NAME
            }
        } else if (this.current === ParserStatus.WAITING_HEADER_BLOCK_END) {
            if (char === '\n') {
                this.current = ParserStatus.WAITING_BODY
            }
        } else if (this.current === ParserStatus.WAITING_BODY) {
            this.bodyParser.receiveChar(char)
        }
    }
}

enum TrunkedStatus {
    WAITING_LENGTH,
    WAITING_LENGTH_LINE_END,
    READING_TRUNK,
    WAITING_NEW_LINE,
    WAITING_NEW_LINE_END
}

class TrunkedBodyParser {
    length: number
    content: Array<string>
    isFinished: boolean
    current: number

    constructor() {
        this.length = 0
        this.content = []
        this.isFinished = false
        this.current = TrunkedStatus.WAITING_LENGTH
    }

    receiveChar(char: string) {
        if (this.current === TrunkedStatus.WAITING_LENGTH) {
            if (char === '\r') {
                if (this.length === 0) {
                    this.isFinished = true
                }
                this.current = TrunkedStatus.WAITING_LENGTH_LINE_END
            } else {
                this.length *= 16
                this.length += parseInt(char, 16)
            }
        } else if (this.current === TrunkedStatus.WAITING_LENGTH_LINE_END) {
            if (char === '\n') {
                this.current = TrunkedStatus.READING_TRUNK
            }
        } else if (this.current === TrunkedStatus.READING_TRUNK) {
            if (char !== '\r' && char !== '\n') {
                this.content.push(char)
                this.length--
            }
            if (this.length === 0) {
                this.current = TrunkedStatus.WAITING_NEW_LINE
            }
        } else if (this.current === TrunkedStatus.WAITING_NEW_LINE) {
            if (char === '\r') {
                this.current = TrunkedStatus.WAITING_NEW_LINE_END
            }
        } else if (this.current === TrunkedStatus.WAITING_NEW_LINE_END) {
            if (char === '\n') {
                this.current = TrunkedStatus.WAITING_LENGTH
            }
        }
    }
}

void async function () {
    let request = new ToyRequest({
        method: 'POST',
        host: '127.0.0.1',
        port: 1234,
        path: '/',
        headers: {
            ['X-Foo2']: 'customed'
        },
        body: {
            name: 'meskil'
        }
    })
    let res = await request.send()
    console.log(res)
}()
