const http = require('http')
const server = http.createServer((req, res) => {
    console.log('request received')
    res.setHeader('Content-Type', 'text/html')
    res.setHeader('X-Foo', 'bar')
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end(
        `<html maaa=a >
            <head>
                <style>
            body div #myid{
                width:100px;
                background-color: #ff5000;
            }
            body div img{
                width:30px;
                background-color: #ff1111;
            }
            body div .test{
            
            }
                </style>
            </head>
            <body>
                <div>
                    <img id="myid"/>
                    <img class="test again" />
                </div>
            </body>
        </html>
        `)
})
server.listen(8099, () => {
    console.log('localhost:8099 is work...')
})
