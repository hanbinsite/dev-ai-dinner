<template>
    <div class="success-page">
    <!-- 顶部成功图标 -->
    <div class="success-icon">
      <van-icon name="checked" size="80" color="#07c160" />
      <div class="success-text">扫码成功</div>
    </div>

    <!-- 桌号信息卡 -->
    <div class="table-card">
      <van-icon name="label-o" size="24" color="#666" />
      <div class="table-info">
        <p class="table-label">当前桌号</p>
        <h2 class="table-number">{{ tableNumber || '请扫桌码' }}</h2>
      </div>
    </div>

    <!-- 操作按钮组 -->
    <div class="action-buttons">
      <van-button 
        type="primary" 
        block 
        round
        icon="shopping-cart-o"
        class="main-btn"
        @click="goToMenu"
      >
        立即点餐
      </van-button>
      
      <van-button 
        plain 
        hairline
        round
        icon="scan"
        class="sub-btn"
        @click="rescan"
      >
        重新扫码
      </van-button>
    </div>

    <!-- 底部装饰线 -->
    <div class="deco-line"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const tableNumber = ref(route.query.tableNumber || '未知桌号')

const goToMenu = () => {
  router.push('/menu')
}

const rescan = () => {
  router.push('/scan')
}
</script>

<style scoped>
.success-container {
  padding: 20px;
}
.success-card {
  max-width: 800px;
  margin: 0 auto;
}
.button-group {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}
.menu-button {
  flex: 1;
}
.rescan-button {
  flex: 1;
}
/* 核心样式 */
.success-page {
  background: #f8f8f8;
  min-height: 100vh;
  padding: 40px 20px;
  text-align: center;
}

/* 成功图标区域 */
.success-icon {
  margin: 40px 0;
  animation: bounceIn 0.6s ease;
}
.success-text {
  font-size: 18px;
  color: #666;
  margin-top: 12px;
}

/* 桌号卡片 */
.table-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin: 0 20px 40px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: slideUp 0.8s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}
.table-number {
  font-size: 48px;
  color: #ff9d00;
  margin: 8px 0;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}

/* 按钮样式 */
.main-btn {
  background: linear-gradient(to right, #ffd700, #ff9d00);
  border: none;
  color: white;
  height: 50px;
  font-size: 18px;
  margin: 20px 0;
  box-shadow: 0 4px 12px rgba(255, 157, 0, 0.2);
}

.sub-btn {
  border-color: #ff9d00;
  color: #ff9d00;
  height: 44px;
}

/* 装饰线 */
.deco-line {
  width: 120px;
  height: 4px;
  background: #eee;
  border-radius: 2px;
  margin: 40px auto 0;
}

/* 动画效果 */
@keyframes bounceIn {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes slideUp {
  0% { transform: translateY(30px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
</style>