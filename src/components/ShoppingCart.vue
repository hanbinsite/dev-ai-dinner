<template>
  <el-drawer
    v-model="visible"
    title="我的购物车"
    direction="rtl"
    size="30%"
  >
    <el-scrollbar height="75vh">
      <div class="cart-item" v-for="item in cartStore.items" :key="item.id">
        <div class="item-info">
          <h4>{{ item.name }}</h4>
          <el-input-number
            v-model="item.quantity"
            :min="1"
            :max="10"
            @change="cartStore.updateQuantity(item.id, $event)"
          />
          <span class="price">¥{{ item.price * item.quantity }}</span>
        </div>
        <el-button
          type="danger"
          icon="el-icon-delete"
          circle
          @click="cartStore.removeItem(item.id)"
        />
      </div>
    </el-scrollbar>
    
    <div class="checkout-bar">
      <span class="total">总计：¥{{ cartStore.total }}</span>
      <el-button type="success" @click="handleCheckout">立即结算</el-button>
    </div>
  </el-drawer>
</template>

<script setup>
import { useCartStore } from '../stores/cartStore'

const cartStore = useCartStore()
const visible = ref(true)

const handleCheckout = () => {
  ElMessage.success(`结算成功！总金额：¥${cartStore.total}`)
  cartStore.clearCart()
}
</script>

<style scoped>
.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
}
.item-info {
  flex: 1;
  margin-right: 15px;
}
.price {
  color: #f56c6c;
  font-weight: bold;
}
.checkout-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px;
  background: #fff;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.total {
  font-size: 18px;
  color: #333;
  font-weight: bold;
}
</style>