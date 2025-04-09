<template>
  <div class="home-container">
    <div class="button-container">
      <van-button type="primary" size="large" @click="handleScanClick">扫码点餐</van-button>
      <van-button type="success" size="large" @click="goToOrderPage">饿了么风格点餐</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const skipCamera = ref(true) // 控制是否跳过摄像头直接跳转

const handleScanClick = () => {
  if (skipCamera.value) {
    // 跳过摄像头直接跳转，传递模拟桌号
    router.push({
      path: '/scan-success',
      query: { tableNumber: 'A01' }
    })
  } else {
    // 正常流程进入扫码页面
    router.push('/scan')
  }
}

const goToOrderPage = () => {
  router.push('/order')
}
</script>

<style scoped>
.home-container {
  height: 100vh;
  background-image: url('/recommend-dishes.jpg');
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.button-container {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.van-button {
  padding: 1rem 2rem;
  font-size: 1.2rem;
  width: 200px;
}

@media (max-width: 768px) {
  .van-button {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    width: 180px;
  }
}
</style>