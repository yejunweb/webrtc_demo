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

