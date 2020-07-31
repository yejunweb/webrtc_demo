var localVideo = document.querySelector('.local_video video')
var remoteVideo = document.querySelector('.remote_video video')
var btnStart = document.querySelector('.button_group .start')
var btnBreak = document.querySelector('.button_group .break')
var localStream
var socket
var roomId
var pc
var state

// 参数配置
var streamOptions = {
  video: {
    width: 960,
    height: 400,
    frameRate: 30
  },
  audio: false
}
var offerOptions = {
  offerToReceiveVideo: 1,
  offerToReceiveAudio: 0
}

// 获取房间号
function getParams() {
  let urlParamsList = window.location.pathname.split('/')
  let urlParams = ''
  urlParamsList.forEach((item, i) => {
    if (item === 'room') {
      urlParams = urlParamsList[i + 1]
    }
  })
  return urlParams
}
roomId = getParams()

// 是否支持视频流
function handleJudge() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    alert('对不起，您的浏览器不支持摄像功能！')
  }
}

// 获取摄像源
async function initLocalStream() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia(streamOptions)
    localVideo.srcObject = localStream
    createPeerConnection()
  } catch(err) {
    console.log(err)
  }
}

socket = io.connect()

function initConnectServer() {
  socket.emit('join', roomId)
  // 加入后状态
  socket.on('joined', data => {
    console.log(data)
    state = 'joined'
    createPeerConnection()
  })
  // 其他人加入后状态
  socket.on('otherJoined', data => {
    console.log(data)
    state = 'other_joined'
    call()
  })
  // 其他人加入后，创建offer发送到信令服务器，返回收到offer，再创建answer
  socket.on('message', (room, data) => {
    // 
    if (data.type === 'offer') {
      console.log(data)
      pc.setRemoteDescription(data)
      pc.createAnswer().then(res => {
        getAnswer(res)
      })
    } else if (data.type === 'answer') {
      pc.setRemoteDescription(data)
    } else if (data.type === 'candidate') {
      pc.addIceCandidate(data.value)
    }
  })
}

function breakConnectServer() {
  socket.emit('leave', roomId)
  socket.on('leaved', data => {
    console.log(data)
  })
}

function call() {
  if (state === 'other_joined' && pc) {
    var offerOptions = {
			offerToRecieveAudio: 9,
			offerToRecieveVideo: 1
		}
    pc.createOffer(offerOptions).then(res => {
      getOffer(res)
    })
  } 
}

function getOffer(desc) {
  pc.setLocalDescription(desc)
  socket.emit('message', roomId, desc)
}

function getAnswer(desc) {
  pc.setLocalDescription(desc)
  socket.emit('message', roomId, desc)
}

var pcConfig = {
  'iceServers': [{
    'urls': 'turn:stun.al.learningrtc.cn:3478',
    'credential': "mypasswd",
    'username': "garrylea"
  }]
}
function createPeerConnection() {
  if (!pc) {
    pc = new RTCPeerConnection(pcConfig)
    pc.onicecandidate = function(e) {
      if (e.candidate) {
        pc.addIceCandidate(e.candidate)
        socket.emit('message', roomId, {
          type: 'candidate',
					value: e.candidate
        })
      }
    }
    pc.ontrack = function(e) {
      console.log(e)
      remoteVideo.srcObject = e.streams[0]
    }
  }
  if (localStream) {
    localStream.getTracks().forEach(track => {
      pc.addTrack(track, localStream)
    })
  }
}

// 
btnStart.onclick = function() {
  initConnectServer()
}
btnBreak.onclick = function() {
  breakConnectServer()
}
handleJudge()
initLocalStream()
initConnectServer()