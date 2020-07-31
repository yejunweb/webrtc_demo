# WebRTC

## [websocket教程](http://www.ruanyifeng.com/blog/2017/05/websocket.html)

## forever

	npm i forever -g
	forever start app.js
	forever end app.js

## 创建https服务

	const express = require('express')
	const app = express()
	const http = require('http')
	const https = require('https')
	const fs = require('fs')
	
	const httpPort = 3000
	const httpsPort = 3001
	
	// 创建http服务
	const httpServe = http.createServer(app)
	
	// 创建https服务
	const options = {
		key  : fs.readFileSync('./cert/private.pem'),
		cert : fs.readFileSync('./cert/file.crt') 
	}
	const httpsServe = https.createServer(options, app)
	
	app.use('/', express.static('./'))
	
	// 监听端口
	httpServe.listen(httpPort, () => {
	    console.log('http://localhost:3000')
	})
	httpsServe.listen(httpsPort, () => {
	    console.log('https://localhost:3001')
	})
	
	// 
	app.get('/', (req, res) => {
	    fs.readFile('./views/index.html', 'utf8', (err, data) => {
	        if (err) return console.log(err)
	        res.send(data)
	    })
	})

## [利用　openssl　生成公钥私钥](https://blog.csdn.net/qq_39081974/article/details/81059022)

	生成公钥： openssl genrsa -out rsa_private_key.pem 1024 
	生成私钥: openssl rsa -in rsa_private_key.pem -pubout -out rsa_public_key.pem

## [生成证书](https://www.cnblogs.com/ihzeng/p/10447652.html)

	＃生成私钥key文件
	openssl genrsa 1024 > ./private.pem
	
	＃通过私钥文件生成CSR证书签名
	openssl req -new -key ./private.pem -out csr.pem
	
	＃通过私钥文件和CSR证书签名生成证书文件
	openssl x509 -req -days 365 -in csr.pem -signkey ./private.pem -out ./file.crt

## 信令服务器

### 使用 socket.io
	装包 npm install socket.io

### [使用log4js](https://www.jianshu.com/p/34b446f84e8a)
	装包 npm install log4js
	
	const log4js = require('log4js')
	log4js.configure({
	    appenders: {
	        file: {
	            type: 'file',
	            filename: 'app.log',
	            layout: {
	                type: 'pattern',
	                pattern: '%r %p - %m',
	            }
	        }
	    },
	    categories: {
	       default: {
	          appenders: ['file'],
	          level: 'debug'
	       }
	    }	
	})
	var logger = log4js.getLogger()

	logger.debug('this is debug')

## 

	RTCPeerConnection 的属性 onicecandidate （是一个事件触发器 EventHandler） 能够让函数在事件icecandidate发生在实例  RTCPeerConnection 上时被调用。 只要本地代理ICE 需要通过信令服务器传递信息给其他对等端时就会触发。 这让本地代理与其他对等体相协商而浏览器本身在使用时无需知道任何详细的有关信令技术的细节，只需要简单地应用这种方法就可使用您选择的任何消息传递技术将ICE候选发送到远程对等方。

## 1对1传输基本流程

	创建 new RTCPeerConnection() 对象
	
	推入本地的音视频流
	localStream.getTracks().forEach(track => {
		pc1.addTrack(track, localStream)
	})

	创建offer createOffer

	创建answer createAnswer

	将远程的音视频流通过 ontrack 捕获并渲染

## SDP规范

### 组成

- 会话层（相当于是全局变量，一旦设置，全局有效）
	- 会话的名称和目的
	- 会话的存活时间
	- 会话层中包括多个媒体信息
- 媒体层（流）
	- 媒体格式
	- 使用的传输协议
	- 具体传输的ip和端口 icecandidate
	- 媒体负载类型

## 格式

- 由多个 <type> => <value> 组成
- 会话层
- 媒体层
	- m 媒体信息
	- c 传输相关信息
	- b 带宽信息
	- a 对于媒体信息的描述
