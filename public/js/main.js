// 配置
var streamOptions = {
  video: {
    width: 960,
    height: 400,
    frameRate: 30
  },
  audio: false
}
var localVideo = document.querySelector('.local_video video')
var remoteVideo = document.querySelector('.remote_video video')
var btnStart = document.querySelector('.button_group .start')
var btnCall = document.querySelector('.button_group .call')
var btnBreak = document.querySelector('.button_group .break')
var localStream // 本地流
var pc1
var pc2

btnStart.onclick = function() {
  initLoaclVideo()
}
btnCall.onclick = function() {
  call()
}
btnBreak.onclick = function() {
  pc1.close()
  pc2.close()
  pc1 = null
  pc2 = null
}

// 判断是否支持视频流
function handleJudge() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    alert('对不起，您的浏览器不支持摄像功能！')
  }
}
handleJudge()

// 获取摄像源
async function initLoaclVideo() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia(streamOptions)
    localVideo.srcObject = localStream
  } catch(err) {
    console.log(err)
  }
}

//  建立对等连接
function getOffer(desc) {
  pc1.setLocalDescription(desc)
  pc2.setRemoteDescription(desc)
  // 
  pc2.createAnswer().then(res => {
    getAnswer(res)
  })
}
function getAnswer(desc) {
  pc2.setLocalDescription(desc)
  pc1.setRemoteDescription(desc)
}

// 
function call() {
  pc1 = new RTCPeerConnection()
  pc2 = new RTCPeerConnection()

  // 收集响应候选列表，如pc1建立对等连接时，则向pc2中添加候选列表
  pc1.onicecandidate = function(e) {
    pc2.addIceCandidate(e.candidate)
  }
  pc2.onicecandidate = function(e) {
    pc1.addIceCandidate(e.candidate)
  }

  // 获取到远端音视频流
  pc2.ontrack = function(e) {
    console.log(e)
    remoteVideo.srcObject = e.streams[0]
  }

  // getTracks获取本地的所有音视频流
  localStream.getTracks().forEach(track => {
    pc1.addTrack(track, localStream)
  })

  // 创建媒体协商
  var offerOptions = {
    offerToReceiveVideo: 1,
    offerToReceiveAudio: 0
  }
  pc1.createOffer(offerOptions).then(res => {
    console.log(res)
    getOffer(res)
  })
}