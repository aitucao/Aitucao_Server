var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(8080);
console.log('启动服务器，监听8080端口');

//接收手机端来的消息
app.post('/send', function (req, res) {
    res.send('收到post请求');
});

//可以获得一个页面方便调试
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/test/index.html');
})

io.on('connection', function (socket) {
    console.log('a user connected');
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
        console.log(data);
    });
    socket.on('disconnect', function (data) {
        console.log('a user disconnected');
    });
});