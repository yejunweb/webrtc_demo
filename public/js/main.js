/** 
 * 获取所有媒体设备
 *  deviceId 设备Id
 *  groupId  两个Id相同，说明是同一物理设备
 *  kind     设备种类
 *  lable    设备名称
 */
var ePromise = navigator.mediaDevices.enumerateDevices()
ePromise.then((res) => {
  console.log(res)
  let videoInputList = ''
  let audioInputList = ''
  res.forEach((item, i) => {
    if (item.kind === 'videoinput') {
      videoInputList += `<li><a href="javascript:void(0)">${ item.label }</a></li>`
    } else if (item.kind === 'audioinput') {
      audioInputList += `<li><a href="javascript:void(0)">${ item.label }</a></li>`
    }
  })
  document.querySelector('.video_input_list .dropdown-menu').innerHTML = videoInputList === '' ? '<li><a href="javascript:void(0)">暂无数据</a></li>' : videoInputList
  document.querySelector('.audio_input_list .dropdown-menu').innerHTML = audioInputList === '' ? '<li><a href="javascript:void(0)">暂无数据</a></li>' : audioInputList
})

/**
 * video参数约束
 *  width      宽度
 *  height     高度
 *  frameRate  帧率
 *  facimgMode 设备类型（前后摄像头）
 * audio参数约束
 *  volume       音量（范围 0 ~ 1）
 *  sampleRate   采样率
 *  sampleSize   采样大小
 *  echoCancellation 回音消除
 *  autoGainContral  音量增益
 *  noiseSuppression 降噪
 *  latency      延迟大小
 *  channelCount 单双声道
 *  deviceID     设备id
 *  groupID      物理设备id
 */
const video = document.querySelector('.video_content video')
const constraints = {
  video: {
    width: 600,
    height: 400,
    frameRate: 30
  },
  audio: false
}

// 判断是否支持视频流
function handleJudge() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    alert('对不起，您的浏览器不支持摄像功能！')
  }
}
function handleError(err) {
  alert(err)
}

// 图像源为摄像头
async function initCameraVideo() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    video.srcObject = stream
  } catch(err) {
    handleError(err)
  }
}
initCameraVideo()

// 图像源为桌面
async function initDesktopVideo() {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia(constraints)
    video.srcObject = stream
  } catch(err) {
    handleError(err)
  }
}

// 视频效果渲染
var filterList = document.querySelectorAll('.filter_list .dropdown-menu li')
filterList.forEach((item, i) => {
  item.onclick = function() {
    video.className = item.children[0].dataset.type
    document.querySelector('.filter_list button').innerHTML = item.children[0].innerHTML + ' ' + '<span class="caret"></span>'
  }
})

// 聊天室部分
var socket = io('/')
var connectName // 用户名称
var connectRoom // 房间名称
var sendContent
var messageContent
var connectButton = document.querySelector('.connect_button')
var disconnectButton = document.querySelector('.disconnect_button')
var sendButton = document.querySelector('.send_button')

// 更新数据
function setMessageContent(name, msg) {
  messageContent = document.querySelector('.message_content').innerHTML
  messageContent += `
  <p>
    <b>${name}：</b><span>${msg}</span>
  </p>
  `
  document.querySelector('.message_content').innerHTML = messageContent
}
/**
 * 点击加入房间
 * 点击断开连接
 * 点击发送信息，清空输入框
 */
connectButton.onclick = function() {
  connectName = document.querySelector('.connect_name').value
  connectRoom = document.querySelector('.connect_room').value
  socket.emit('join', {
    userName: connectName,
    roomId: connectRoom
  })
}
disconnectButton.onclick = function() {
  socket.emit('leave', {
    userName: connectName,
    roomId: connectRoom
  })
}
sendButton.onclick = function() {
  sendContent = document.querySelector('.send_content').value
  document.querySelector('.send_content').value = ''
  socket.emit('message', {
    userName: connectName,
    roomId: connectRoom,
    message: sendContent
  })
}
/**
 * 系统消息返显
 * 监听人数变化
 */
socket.on('system', data => {
  setMessageContent(data.userName, data.message)
})
socket.on('number', data => {
  document.querySelector('.message_title').innerHTML = `当前房间人数为：${data}`
})