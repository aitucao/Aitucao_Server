var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(8080);
console.log('启动服务器，监听8080端口');

//接收手机端来的消息
app.post('/send', function (req, res) {
  res.send('收到post请求');
});

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});