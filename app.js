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

// 
var roomList = new Array
io.on('connection', function(socket) {
    /**
     * 加入房间
     */
    socket.on('join', data => {
        socket.join(data.roomId)
        io.sockets.in(data.roomId).emit('system', {
            userName: '系统提示',
            message: `用户（${data.userName}）加入了房间（${data.roomId}）`
        })
        // 添加到数组
        roomList.push({
            userName: data.userName,
            roomId: data.roomId,
            socketId: socket.id
        })
        let room_id = data.roomId
        changeNumber(room_id, io.sockets.adapter.rooms[room_id].length)
        // 关闭页面回调
        socket.on('disconnect', () => {
            roomList.forEach(item => {
                if (item.socketId === socket.id) {
                    io.sockets.in(room_id).emit('system', {
                        userName: '系统提示',
                        message: `用户（${data.userName}）离开了房间（${room_id}）`
                    })
                }
            })
            socket.leave(room_id)
        })
    })
    /**
     * 离开房间
     */
    socket.on('leave', data => {
        roomList.forEach(item => {
            if (item.socketId === socket.id) {
                io.sockets.in(data.roomId).emit('system', {
                    userName: '系统提示',
                    message: `用户（${data.userName}）离开了房间（${data.roomId}）`
                })
            }
        })
        changeNumber(data.roomId, io.sockets.adapter.rooms[data.roomId].length - 1)
        socket.leave(data.roomId)
    })
    // 发送信息
    socket.on('message', data => {
        io.sockets.in(data.roomId).emit('system', {
            userName: data.userName,
            message: data.message
        })
    })
    // 实时人数
    function changeNumber(room, data) {
        io.sockets.in(room).emit('number', data)
    }
})