var ws = require('websocket.io'),
    wsServer = ws.listen(8686),
    webServer = require('express')(),
    chalk = require('chalk');
    
//维护所有房间
global.rooms = {};

//webserver处理和手机端的通信

//发送数据的接口
webServer.get('/msg/:room/:msg', function (req, res) {
    console.log(chalk.magenta("GET: reach web server /msg"));
    console.log(chalk.magenta("room: "+req.params.room));
    console.log(chalk.magenta("msg: "+req.params.msg));
    
    if(rooms[req.params.room]) {
        var ret = {
            type: "TEXT",
            data: req.params.msg
        }
        //发送数据
        rooms[req.params.room].socket.send(JSON.stringify(ret));
        
        res.send('0');
    } else {
        res.send('-1');
    }
    
});

//撤回的接口
webServer.get('/back/:room/:messageid', function (req, res) {
    console.log(chalk.magenta("GET: reach web server /back/"+req.params.room+"/"+req.params.messageid));
    
    if(rooms[req.params.room]) {
        var ret = {
            type: "BACK",
            data: req.params.messageid
        }
        //发送数据
        rooms[req.params.room].socket.send(JSON.stringify(ret));
        
        res.send('0');
    } else {
        res.send('-1');
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
    console.log(chalk.blue("a user connected:"+socket.socket.address()));
    
    socket.on('message', function (data) { 
        console.log(data);

        var message;
        try {
            message = JSON.parse(data);
        } catch (error) {
            console.log(chalk.red(error));
            return;
        }

        console.log(chalk.blue(message.type));
        
        switch(message.type) {
            //创建房间
            case "CREATE_ROOM":
                var room = Math.floor(Math.random()*90000) + 10000;
                rooms[room] = {
                    room: room,
                    socket: socket
                }
                var ret = {
                    type: "CREATE_ROOM",
                    data: room,
                }
                try {
                    socket.send(JSON.stringify(ret));
                } catch (error) {
                    console.log(chalk.blue(error));
                }
                break;
            //恢复房间
            case "RECONNECT_ROOM":
                //如果需要重连房间，则替换当前房间列表中的映射
                if(typeof message.data == 'Number' ){
                    rooms[message.data] = {
                        room: message.data,
                        socket: socket
                    }
                    var ret = {
                        type: "RECONNECT_ROOM",
                        data: 'success',
                    }
                    try {
                        socket.send(JSON.stringify(ret));
                    } catch (error) {
                        console.log(chalk.blue(error));
                    }
                }
                break;
            case "LEAVE_ROOM":
                // if(rooms[message.data]){
                //     delete rooms[message.data];
                // }
                break;
            default:
                console.log(chalk.blue("unknown connection"));
                socket.send("unknown");
                break;
        }
        
    });
    socket.on('close', function () {
        console.log(chalk.blue("a user disconnected"));
        console.log(Object.keys(rooms));
        for(key in rooms) {
            if(rooms[key].socket == socket){
                delete rooms[key];
            }
        }
        console.log(Object.keys(rooms));
        
    });
    socket.on('error', function (data) {
        console.log(chalk.blue("error ocurred"));
        console.log(Object.keys(rooms));
        // rooms.forEach(function (ele) {
        //     console.log(ele);
        // });
    });
});