<template>
  <div class="scan-container">
    <van-cell-group class="scan-card">
      <van-cell title="扫码点餐" />
      <van-button type="primary" block @click="startScan">开始扫描</van-button>
      
      <div class="preview-wrapper">
        <video ref="video" class="preview-video" autoplay></video>
        <canvas ref="canvas" class="preview-canvas" />
      </div>
      
      <div v-if="scanResult" class="result-box">
        <van-notice-bar :text="`扫描结果：${scanResult}`" color="#07c160" background="#f8f8f8" />
      </div>
    </van-cell-group>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import QrcodeReader from 'qrcode-reader'
import { useRouter } from 'vue-router'

const router = useRouter()
const video = ref(null)
const canvas = ref(null)
const scanResult = ref('')
const skipCamera = ref(true)

const startScan = async () => {
  if (skipCamera.value) {
    router.push({
      path: '/scan-success',
      query: { tableNumber: 'A01' }
    })
    return
  }
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    video.value.srcObject = stream
    scanLoop()
  } catch (error) {
    console.error('摄像头访问失败:', error)
  }
}

const scanLoop = () => {
  const context = canvas.value.getContext('2d')
  context.drawImage(video.value, 0, 0, 300, 300)
  
  const qr = new QrcodeReader()
  qr.callback = (result) => {
    if (result) {
      scanResult.value = result
      video.value.srcObject.getTracks().forEach(track => track.stop())
      router.push({
        path: '/scan-success',
        query: { tableNumber: result }
      })
    } else {
      requestAnimationFrame(scanLoop)
    }
  }
  qr.decode(canvas.value)
}
</script>

<style scoped>
.scan-container {
  padding: 20px;
}
.scan-card {
  max-width: 800px;
  margin: 0 auto;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.preview-wrapper {
  position: relative;
  width: 100%;
  height: 300px;
}
.preview-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.preview-canvas {
  display: none;
}
.result-box {
  margin-top: 20px;
}
</style>