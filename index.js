var ws = require('websocket.io'),
    wsServer = ws.listen(8686),
    webServer = require('express')(),
    chalk = require('chalk');
    
//维护所有房间
var rooms = {};

//webserver处理和手机端的通信

//发送数据的接口
webServer.get('/msg/:room/:msg', function (req, res) {
    console.log(chalk.magenta("GET: reach web server /msg"));
    console.log(chalk.magenta("room: "+req.params.room));
    console.log(chalk.magenta("msg: "+req.params.msg));
    
    if(rooms[req.params.room]) {
        let ret = {
            type: "SEND_MESSAGE",
            msg: req.params.msg
        }
        //发送数据
        rooms[req.params.room].socket.send(JSON.stringify(ret));
        var resData = {
            code: 0,
            data: {
                room: req.params.room,
                msg: req.params.msg
            }
        };
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(resData));
    } 
    
});

//获取房间名称的接口
webServer.get('/room/:room', function (req, res) {
    console.log(chalk.magenta("GET: reach web server /room"));
    console.log(chalk.magenta("GET: room" + req.params.room + " info"));
    
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
        code: 0,
        data:{ 
            room: req.params.room,
            name: "test room"
        }
    }));
});

webServer.listen(3000, function () {
    console.log(chalk.blue("web server listen on 3000"));
})

//websocket服务处理和pc的通信
wsServer.on('connection', function (socket) {
    console.log(chalk.blue("a user connected"));
    console.log(socket.socket.address());
    
    socket.on('message', function (data) { 
        var message;
        try {
            message = JSON.parse(data);
        } catch (error) {
            console.log(chalk.red(error));
            return;
        }
        
        switch(message.type) {
            //创建房间
            case "CREAT_ROOM":
                let room = Math.floor(Math.random()*90000) + 10000;
                rooms[room] = {
                    room: room,
                    socket: socket
                }
                let ret = {
                    type: "CREAT_ROOM",
                    room: room,
                }
                socket.send(JSON.stringify(ret));
                break;
            default:
                console.log(chalk.blue("unknown connection"));
                break;
        }
        
    });
    socket.on('close', function () {
        console.log(chalk.blue("a user disconnected"));
    });
});