var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const net = require('net');
const parser = require('./parseHTML');
class ToyRequest {
    constructor(options) {
        this.method = options.method || 'GET';
        this.path = options.path || '/';
        this.host = options.host;
        this.port = options.port || 80;
        this.body = options.body || {};
        this.headers = options.headers || {};
        if (!this.headers['Content-Type']) {
            this.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
        if (this.headers['Content-Type'] === 'application/json') {
            this.bodyText = JSON.stringify(this.body);
        }
        else if (this.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
            this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&');
        }
        this.headers['Content-Length'] = this.bodyText.length;
    }
    toString() {
        return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}
\r
${this.bodyText}
`;
    }
    send(connection) {
        return new Promise((resolve, reject) => {
            const parser = new ResponseParser();
            if (connection) {
                connection.write(this.toString());
            }
            else {
                connection = net.createConnection({
                    host: this.host,
                    port: this.port
                }, () => {
                    connection.write(this.toString());
                });
            }
            connection.on('data', (data) => {
                console.log(data.toString());
                parser.receive(data.toString());
                if (parser.isFinished) {
                    resolve(parser.response);
                    connection.end();
                }
                // resolve(data.toString())
            });
            connection.on('error', (err) => {
                reject(err);
                connection.end();
            });
        });
    }
}
class ToyResponse {
}
var ParserStatus;
(function (ParserStatus) {
    ParserStatus[ParserStatus["WAITING_STATUS_LINE"] = 0] = "WAITING_STATUS_LINE";
    ParserStatus[ParserStatus["WAITING_STATUS_LINE_END"] = 1] = "WAITING_STATUS_LINE_END";
    ParserStatus[ParserStatus["WAITING_HEADER_NAME"] = 2] = "WAITING_HEADER_NAME";
    ParserStatus[ParserStatus["WAITING_HEADER_SPACE"] = 3] = "WAITING_HEADER_SPACE";
    ParserStatus[ParserStatus["WAITING_HEADER_VALUE"] = 4] = "WAITING_HEADER_VALUE";
    ParserStatus[ParserStatus["WAITING_HEADER_LINE_END"] = 5] = "WAITING_HEADER_LINE_END";
    ParserStatus[ParserStatus["WAITING_HEADER_BLOCK_END"] = 6] = "WAITING_HEADER_BLOCK_END";
    ParserStatus[ParserStatus["WAITING_BODY"] = 7] = "WAITING_BODY";
})(ParserStatus || (ParserStatus = {}));
class ResponseParser {
    constructor() {
        this.current = ParserStatus.WAITING_STATUS_LINE;
        this.statusLine = '';
        this.headers = {};
        this.headerName = '';
        this.headerValue = '';
    }
    get isFinished() {
        return this.bodyParser && this.bodyParser.isFinished;
    }
    get response() {
        this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([^\r\n]+)/);
        return {
            statusCode: RegExp.$1,
            statusText: RegExp.$2,
            headers: this.headers,
            body: this.bodyParser.content.join('')
        };
    }
    receive(string) {
        for (let i = 0; i < string.length; i++) {
            this.receiveChar(string.charAt(i));
        }
    }
    receiveChar(char) {
        if (this.current === ParserStatus.WAITING_STATUS_LINE) {
            if (char === '\r') {
                this.current = ParserStatus.WAITING_STATUS_LINE_END;
            }
            if (char === '\n') {
                this.current = ParserStatus.WAITING_HEADER_NAME;
            }
            else {
                this.statusLine += char;
            }
        }
        else if (this.current === ParserStatus.WAITING_STATUS_LINE_END) {
            if (char === '\n') {
                this.current = ParserStatus.WAITING_HEADER_NAME;
            }
        }
        else if (this.current === ParserStatus.WAITING_HEADER_NAME) {
            if (char === ':') {
                this.current = ParserStatus.WAITING_HEADER_SPACE;
            }
            else if (char === '\r') {
                this.current = ParserStatus.WAITING_HEADER_BLOCK_END;
                if (this.headers['Transfer-Encoding'] === 'chunked') {
                    this.bodyParser = new TrunkedBodyParser();
                }
            }
            else {
                this.headerName += char;
            }
        }
        else if (this.current === ParserStatus.WAITING_HEADER_SPACE) {
            if (char === ' ') {
                this.current = ParserStatus.WAITING_HEADER_VALUE;
            }
        }
        else if (this.current === ParserStatus.WAITING_HEADER_VALUE) {
            if (char === '\r') {
                this.current = ParserStatus.WAITING_HEADER_LINE_END;
                this.headers[this.headerName] = this.headerValue;
                this.headerName = '';
                this.headerValue = '';
            }
            else {
                this.headerValue += char;
            }
        }
        else if (this.current === ParserStatus.WAITING_HEADER_LINE_END) {
            if (char === '\n') {
                this.current = ParserStatus.WAITING_HEADER_NAME;
            }
        }
        else if (this.current === ParserStatus.WAITING_HEADER_BLOCK_END) {
            if (char === '\n') {
                this.current = ParserStatus.WAITING_BODY;
            }
        }
        else if (this.current === ParserStatus.WAITING_BODY) {
            this.bodyParser.receiveChar(char);
        }
    }
}
var TrunkedStatus;
(function (TrunkedStatus) {
    TrunkedStatus[TrunkedStatus["WAITING_LENGTH"] = 0] = "WAITING_LENGTH";
    TrunkedStatus[TrunkedStatus["WAITING_LENGTH_LINE_END"] = 1] = "WAITING_LENGTH_LINE_END";
    TrunkedStatus[TrunkedStatus["READING_TRUNK"] = 2] = "READING_TRUNK";
    TrunkedStatus[TrunkedStatus["WAITING_NEW_LINE"] = 3] = "WAITING_NEW_LINE";
    TrunkedStatus[TrunkedStatus["WAITING_NEW_LINE_END"] = 4] = "WAITING_NEW_LINE_END";
})(TrunkedStatus || (TrunkedStatus = {}));
class TrunkedBodyParser {
    constructor() {
        this.length = 0;
        this.content = [];
        this.isFinished = false;
        this.current = TrunkedStatus.WAITING_LENGTH;
    }
    receiveChar(char) {
        if (this.current === TrunkedStatus.WAITING_LENGTH) {
            if (char === '\r') {
                if (this.length === 0) {
                    this.isFinished = true;
                }
                this.current = TrunkedStatus.WAITING_LENGTH_LINE_END;
            }
            else {
                this.length *= 16;
                this.length += parseInt(char, 16);
            }
        }
        else if (this.current === TrunkedStatus.WAITING_LENGTH_LINE_END) {
            if (char === '\n') {
                this.current = TrunkedStatus.READING_TRUNK;
            }
        }
        else if (this.current === TrunkedStatus.READING_TRUNK) {
            if (char !== '\r' && char !== '\n') {
                this.content.push(char);
            }
            this.length--;
            if (this.length === 0) {
                this.current = TrunkedStatus.WAITING_NEW_LINE;
            }
        }
        else if (this.current === TrunkedStatus.WAITING_NEW_LINE) {
            if (char === '\r') {
                this.current = TrunkedStatus.WAITING_NEW_LINE_END;
            }
        }
        else if (this.current === TrunkedStatus.WAITING_NEW_LINE_END) {
            if (char === '\n') {
                this.current = TrunkedStatus.WAITING_LENGTH;
            }
        }
    }
}
void function () {
    return __awaiter(this, void 0, void 0, function* () {
        let request = new ToyRequest({
            method: 'POST',
            host: '127.0.0.1',
            port: 8099,
            path: '/',
            headers: {
                ['X-Foo2']: 'customed'
            },
            body: {
                name: 'meskil'
            }
        });
        let res = yield request.send();
        console.log(res.body);
        let dom = parser.parseHTML(res.body);
    });
}();
