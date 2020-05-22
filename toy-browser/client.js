var net = require('net');
// http是文本协议
var client = net.createConnection({
    host: '127.0.0.1',
    port: 1234
}, function () {
    var request = new ToyRequest({
        method: 'POST',
        host: '127.0.0.1',
        path: 'localhost',
        port: 10086,
        body: {
            name: 'meskil'
        }
    });
    console.log(request.toString());
});
client.on('data', function (data) {
    console.log(data.toString());
    client.end();
});
client.on('end', function () {
    console.log('disconnected from server');
});
var ToyRequest = /** @class */ (function () {
    function ToyRequest(options) {
        var _this = this;
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
            this.bodyText = Object.keys(this.body).map(function (key) { return key + "=" + encodeURIComponent(_this.body[key]); }).join('&');
        }
        this.headers['Content-Length'] = this.bodyText.length;
    }
    ToyRequest.prototype.toString = function () {
        var _this = this;
        return this.method + " " + this.path + " HTTP/1.1\r\n" + Object.keys(this.headers).map(function (key) { return key + ": " + _this.headers[key]; }).join('\r\n') + "\n\r\n" + this.bodyText + "\n";
    };
    ToyRequest.prototype.send = function (body) {
    };
    return ToyRequest;
}());
