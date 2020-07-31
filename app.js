const express = require('express')
const app = express()
const http = require('http')
const https = require('https')
const fs = require('fs')
const socketIo = require('socket.io')

const httpPort = 3000
const httpsPort = 3001

// 使用log4js
const log4js = require('log4js')
const log4jsConfig = require('./log4js.config.json')
log4js.configure(log4jsConfig)
const logger = log4js.getLogger()

// 创建http、https服务
const options = {
	key : fs.readFileSync('./cert/private.pem'),
	cert : fs.readFileSync('./cert/file.crt') 
}
const httpServe = http.createServer(app)
const httpsServe = https.createServer(options, app)

// socket.io绑定（在端口监听之前）
var io = socketIo.listen(httpsServe)

// 监听端口
httpServe.listen(httpPort, () => {
    // console.log('http://localhost:3000')
    // console.log('http://192.168.43.221:3000')
})
httpsServe.listen(httpsPort, () => {
    console.log('https://localhost:3001')
    console.log('https://192.168.43.221:3001')
})

// 开放目录、发送页面
app.use('/', express.static('./'))
app.get('/', (req, res) => {
    fs.readFile('./views/index.html', 'utf8', (err, data) => {
        if (err) return console.log(err)
        res.send(data)
    })
})
app.get('/room/:roomId', (req, res) => {
    fs.readFile('./views/room.html', 'utf8', (err, data) => {
        if (err) return console.log(err)
        res.send(data)
    })
})

// 
io.on('connection', function(socket) {
    // 加入房间 join joined
    socket.on('join', room => {
        socket.join(room)
        // 
        var myRoom = io.sockets.adapter.rooms[room]
        var users = myRoom ? Object.keys(myRoom.sockets).length : 0
        if (users > 1) {
            io.sockets.in(room).emit('otherJoined', `其他用户[${socket.id}]加入了房间[${room}]`)
        } else {
            io.sockets.in(room).emit('joined', `用户[${socket.id}]加入了房间[${room}]`)
        }
    })
    // 离开房间 leave leaved
    socket.on('leave', room => {
        io.sockets.in(room).emit('leaved', `用户[${socket.id}]离开了房间[${room}]`)
        socket.leave(room)
    })
    // 发送信息 message
    socket.on('message', (room, data) => {
        socket.to(room).emit('message', room, data)
    })
})