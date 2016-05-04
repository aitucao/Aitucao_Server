
var ws = require('websocket.io'),
    server = ws.listen(8686),
    chalk = require('chalk');

server.on('connection', function (socket) {
    console.log(chalk.blue("a user connected"));
    socket.on('message', function (data) { 
        console.log(data);
    });
    socket.on('close', function () { });
});