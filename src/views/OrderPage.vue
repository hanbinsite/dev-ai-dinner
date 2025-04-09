<template>
  <div class="order-page">
    <!-- 顶部导航栏 -->
    <div class="header">
      <div class="header-content">
        <div class="table-info">
          <span class="table-label">桌号：</span>
          <span class="table-number">{{ tableId }}</span>
        </div>
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchKey" 
            placeholder="搜索美食" 
            class="search-input"
            @input="handleSearch"
          />
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧分类导航 -->
      <div class="category-nav">
        <div
          v-for="(cat, index) in filteredCategories"
          :key="cat.id"
          class="category-item"
          :class="{ active: activeCategory === index }"
          @click="scrollToCategory(index)"
        >
          {{ cat.name }}
        </div>
      </div>

      <!-- 右侧商品列表 -->
      <div class="goods-list" ref="goodsListRef">
        <div
          v-for="(cat, index) in filteredCategories"
          :key="cat.id"
          class="category-section"
          :class="`category-${index}`"
        >
          <h3 class="category-title">{{ cat.name }}</h3>
          <div class="goods-grid">
            <div
              v-for="item in cat.items"
              :key="item.id"
              class="goods-item"
              @click="showSpecs(item)"
            >
              <div class="goods-image">
                <img :src="item.image" :alt="item.name" />
                <span v-if="item.isHot" class="hot-tag">热销</span>
              </div>
              <div class="goods-info">
                <h4 class="goods-name">{{ item.name }}</h4>
                <p class="goods-desc">{{ item.desc }}</p>
                <div class="goods-price">
                  <span class="price">¥{{ item.basePrice }}</span>
                  <div class="quantity-control" v-if="item.quantity > 0">
                    <button 
                      class="quantity-btn minus"
                      @click.stop="decreaseQuantity(item)"
                    >-</button>
                    <span class="quantity">{{ item.quantity }}</span>
                    <button 
                      class="quantity-btn plus"
                      @click.stop="increaseQuantity(item)"
                    >+</button>
                  </div>
                  <button v-else class="add-btn" @click.stop="showSpecs(item)">+</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 购物车入口 -->
    <div class="cart-entry" @click="showCartPanel = true">
      <div class="cart-icon">
        <span class="cart-count">{{ cartItemCount }}</span>
      </div>
      <div class="cart-info">
        <div class="cart-price">¥{{ cartTotalPrice }}</div>
      </div>
      <button class="checkout-btn" :disabled="cartItemCount === 0">
        去结算
      </button>
    </div>

    <!-- 规格选择弹窗 -->
    <van-popup
      v-model:show="showSpecPopup"
      position="bottom"
      round
      class="spec-popup"
    >
      <div class="spec-content">
        <div class="spec-header">
          <van-image :src="selectedItem?.image" width="80" height="80" radius="4" />
          <div class="spec-info">
            <h3>{{ selectedItem?.name }}</h3>
            <p class="price">¥{{ specTotalPrice }}</p>
          </div>
          <van-icon name="cross" @click="showSpecPopup = false" />
        </div>
        
        <div 
          v-for="(spec, index) in selectedItem?.specs"
          :key="index"
          class="spec-group"
        >
          <h4>{{ spec.name }}</h4>
          <div class="spec-options">
            <div
              v-for="(opt, oIndex) in spec.options"
              :key="oIndex"
              class="spec-option"
              :class="{ active: activeSpecs[index] === oIndex }"
              @click="selectSpec(index, oIndex)"
            >
              <span class="option-name">{{ opt.name }}</span>
              <span v-if="opt.price > 0" class="option-price">+¥{{ opt.price }}</span>
            </div>
          </div>
        </div>
        
        <div class="spec-footer">
          <van-button
            block
            type="primary"
            round
            class="confirm-spec"
            @click="confirmSpecs"
          >
            加入购物车
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- 购物车面板 -->
    <van-popup
      v-model:show="showCartPanel"
      position="bottom"
      round
      class="cart-popup"
    >
      <div class="cart-content">
        <div class="cart-header">
          <h3>购物车</h3>
          <van-icon name="delete-o" @click="clearCart" />
        </div>
        
        <div v-if="cartItems.length === 0" class="empty-cart">
          <van-empty description="购物车是空的" />
        </div>
        
        <div v-else class="cart-items">
          <div 
            v-for="item in cartItems"
            :key="item.id"
            class="cart-item"
          >
            <div class="info">
              <h4>{{ item.name }}</h4>
              <template v-if="item.selectedSpecs">
                <div class="spec-tags">
                  <span 
                    v-for="(spec, index) in item.selectedSpecs"
                    :key="index"
                    class="spec-tag"
                  >
                    {{ spec.name }}: {{ spec.selected }}
                  </span>
                </div>
              </template>
              <p class="price">¥{{ item.finalPrice * item.quantity }}</p>
            </div>
            <div class="quantity-control">
              <button 
                class="quantity-btn minus"
                @click="decreaseQuantity(item)"
              >-</button>
              <span class="quantity">{{ item.quantity }}</span>
              <button 
                class="quantity-btn plus"
                @click="increaseQuantity(item)"
              >+</button>
            </div>
          </div>
        </div>
        
        <div class="cart-footer">
          <div class="total-info">
            <div class="total-price">
              合计：<span class="price">¥{{ totalPrice }}</span>
            </div>
          </div>
          <van-button
            block
            type="primary"
            round
            class="checkout-btn"
            :disabled="cartItems.length === 0"
            @click="handleCheckout"
          >
            去结算
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import categories from '../api/dataLoader'

const router = useRouter()
const activeCategory = ref(0)
const searchKey = ref('')
const showSpecPopup = ref(false)
const showCartPanel = ref(false)
const selectedItem = ref(null)
const activeSpecs = ref([])
const tableId = ref('A01')
const goodsListRef = ref(null)
const isManualSelect = ref(false)

// 商品数据结构
const goodsCategories = ref(categories.map(cat => ({
  ...cat,
  items: cat.items.map(item => ({
    ...item,
    quantity: 0,
    finalPrice: item.basePrice
  }))
})));

// 过滤后的商品列表
const filteredCategories = computed(() => {
  if (!searchKey.value) {
    return goodsCategories.value
  }

  const searchText = searchKey.value.toLowerCase()
  
  return goodsCategories.value.map(category => ({
    ...category,
    items: category.items.filter(item => {
      // 检查商品名称
      if (item.name.toLowerCase().includes(searchText)) {
        return true
      }
      
      // 检查商品描述
      if (item.desc.toLowerCase().includes(searchText)) {
        return true
      }
      
      // 检查规格名称
      if (item.specs?.some(spec => 
        spec.name.toLowerCase().includes(searchText) ||
        spec.options.some(opt => opt.name.toLowerCase().includes(searchText))
      )) {
        return true
      }
      
      return false
    })
  })).filter(category => category.items.length > 0)
})

// 处理滚动事件
const handleScroll = () => {
  if (isManualSelect.value) return
  
  const goodsList = document.querySelector('.goods-list')
  if (!goodsList) return

  const scrollTop = goodsList.scrollTop
  const categoryElements = document.querySelectorAll('.category-section')
  let currentCategory = activeCategory.value

  categoryElements.forEach((element, index) => {
    const rect = element.getBoundingClientRect()
    // 调整判断条件，使用更合适的阈值
    if (rect.top <= 100 && rect.bottom >= 0) {
      currentCategory = index
    }
  })

  // 只在分类真正改变时才更新
  if (currentCategory !== activeCategory.value) {
    activeCategory.value = currentCategory
  }
}

// 滚动到指定分类
const scrollToCategory = (index) => {
  // 先更新选中状态
  activeCategory.value = index
  
  // 设置手动选择状态
  isManualSelect.value = true
  
  const categoryElement = document.querySelector(`.category-${index}`)
  if (categoryElement) {
    categoryElement.scrollIntoView({ behavior: 'smooth' })
    
    // 使用更长的延时来确保滚动完成
    setTimeout(() => {
      isManualSelect.value = false
    }, 1500)
  }
}

// 当前商品价格计算
const currentPrice = (item) => {
  return item.finalPrice || item.basePrice
}

// 显示规格弹窗
const showSpecs = (item) => {
  selectedItem.value = { ...item }
  activeSpecs.value = new Array(item.specs?.length).fill(0)
  showSpecPopup.value = true
}

// 选择规格
const selectSpec = (specIndex, optionIndex) => {
  activeSpecs.value[specIndex] = optionIndex
}

// 规格总价计算
const specTotalPrice = computed(() => {
  return selectedItem.value?.specs?.reduce((total, spec, index) => {
    return total + spec.options[activeSpecs.value[index]].price
  }, selectedItem.value?.basePrice || 0) || 0
})

// 确认规格选择
const confirmSpecs = () => {
  const specs = selectedItem.value.specs.map((spec, index) => ({
    name: spec.name,
    selected: spec.options[activeSpecs.value[index]].name
  }))
  
  selectedItem.value.finalPrice = specTotalPrice.value
  selectedItem.value.selectedSpecs = specs
  
  // 更新原商品数据
  const categoryIndex = goodsCategories.value.findIndex(cat => 
    cat.items.some(i => i.id === selectedItem.value.id)
  )
  if (categoryIndex !== -1) {
    const itemIndex = goodsCategories.value[categoryIndex].items.findIndex(
      i => i.id === selectedItem.value.id
    )
    if (itemIndex !== -1) {
      // 如果商品已经在购物车中，增加数量
      if (goodsCategories.value[categoryIndex].items[itemIndex].quantity > 0) {
        goodsCategories.value[categoryIndex].items[itemIndex].quantity++
      } else {
        // 否则设置为1
        goodsCategories.value[categoryIndex].items[itemIndex] = {
          ...selectedItem.value,
          quantity: 1
        }
      }
    }
  }
  
  showSpecPopup.value = false
}

// 增加商品数量
const increaseQuantity = (item) => {
  item.quantity++
}

// 减少商品数量
const decreaseQuantity = (item) => {
  if (item.quantity > 0) {
    item.quantity--
  }
}

// 清空购物车
const clearCart = () => {
  goodsCategories.value.forEach(category => {
    category.items.forEach(item => {
      item.quantity = 0
    })
  })
}

// 购物车相关计算
const cartItems = computed(() => {
  return goodsCategories.value
    .flatMap(cat => cat.items)
    .filter(item => item.quantity > 0);
})

const cartItemCount = computed(() => {
  return cartItems.value.reduce((total, item) => total + item.quantity, 0)
})

const cartTotalPrice = computed(() => {
  return cartItems.value.reduce((total, item) => 
    total + (item.finalPrice * item.quantity), 0
  )
})

const totalPrice = computed(() => {
  return cartTotalPrice.value
})

// 处理搜索
const handleSearch = () => {
  // 搜索时重置当前分类
  activeCategory.value = 0
}

// 处理结算
const handleCheckout = () => {
  router.push('/checkout')
}

onMounted(() => {
  const goodsList = document.querySelector('.goods-list')
  if (goodsList) {
    goodsList.addEventListener('scroll', handleScroll)
    // 默认选中第一个分类
    activeCategory.value = 0
  }
})

onUnmounted(() => {
  const goodsList = document.querySelector('.goods-list')
  if (goodsList) {
    goodsList.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style scoped>
.order-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 60px;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  padding: 8px 15px;
  height: 40px;
}

.table-info {
  margin-right: 15px;
  font-size: 16px;
}

.table-number {
  font-weight: bold;
  color: #ff6b6b;
}

.search-box {
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #eee;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
}

.main-content {
  margin-top: 40px;
  display: flex;
  min-height: calc(100vh - 100px);
}

.category-nav {
  width: 80px;
  background-color: #f8f8f8;
  overflow-y: auto;
  position: fixed;
  left: 0;
  top: 40px;
  bottom: 60px;
  padding-top: 10px;
}

.category-item {
  padding: 15px 10px;
  text-align: center;
  font-size: 14px;
  color: #666;
  border-left: 3px solid transparent;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
}

.category-item.active {
  color: #ff6b6b;
  background-color: #fff;
  border-left-color: #ff6b6b;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.category-item.active::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: #ff6b6b;
}

.goods-list {
  flex: 1;
  margin-left: 80px;
  padding: 10px;
  overflow-y: auto;
  height: calc(100vh - 100px);
  padding-bottom: 80px;
}

.category-section {
  margin-bottom: 20px;
}

.category-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  padding-left: 10px;
  border-left: 3px solid #ff6b6b;
}

.goods-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
}

.goods-item {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  padding: 10px;
}

.goods-image {
  position: relative;
  width: 100px;
  height: 100px;
  flex-shrink: 0;
}

.goods-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.hot-tag {
  position: absolute;
  top: 0;
  left: 5px;
  background-color: #ff6b6b;
  color: #fff;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  z-index: 1;
}

.goods-info {
  flex: 1;
  padding: 0 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.goods-name {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
}

.goods-desc {
  font-size: 12px;
  color: #999;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.goods-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  color: #ff6b6b;
  font-weight: bold;
}

.quantity-control {
  display: flex;
  align-items: center;
}

.quantity-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid #ff6b6b;
  background-color: #fff;
  color: #ff6b6b;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.quantity {
  margin: 0 8px;
  min-width: 20px;
  text-align: center;
}

.add-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #ff6b6b;
  color: #fff;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.cart-entry {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: #fff;
  display: flex;
  align-items: center;
  padding: 0 15px;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.cart-icon {
  position: relative;
  margin-right: 15px;
}

.cart-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #ff6b6b;
  color: #fff;
  font-size: 12px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-info {
  flex: 1;
  margin-right: 15px;
}

.cart-price {
  font-size: 16px;
  font-weight: bold;
  color: #ff6b6b;
}

.checkout-btn {
  width: 100px;
  height: 40px;
  background-color: #ff6b6b;
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkout-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.spec-popup {
  height: 60vh;
}

.spec-content {
  padding: 15px;
}

.spec-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.spec-info {
  flex: 1;
  margin-left: 15px;
}

.spec-info h3 {
  font-size: 16px;
  margin-bottom: 5px;
}

.spec-info .price {
  color: #ff6b6b;
  font-weight: bold;
}

.spec-group {
  margin-bottom: 20px;
}

.spec-group h4 {
  font-size: 14px;
  margin-bottom: 10px;
}

.spec-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.spec-option {
  padding: 8px 15px;
  border: 1px solid #eee;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
}

.spec-option.active {
  background-color: #ff6b6b;
  color: #fff;
  border-color: #ff6b6b;
}

.option-price {
  margin-left: 5px;
  color: #ff6b6b;
}

.spec-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px;
  background-color: #fff;
}

.confirm-spec {
  height: 40px;
}

.cart-popup {
  height: 60vh;
}

.cart-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.cart-header h3 {
  font-size: 16px;
  font-weight: bold;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.cart-item .info {
  flex: 1;
}

.cart-item h4 {
  font-size: 14px;
  margin-bottom: 5px;
}

.spec-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 5px;
}

.spec-tag {
  font-size: 12px;
  color: #999;
  background-color: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
}

.cart-item .price {
  color: #ff6b6b;
  font-weight: bold;
}

.cart-footer {
  padding: 15px;
  border-top: 1px solid #eee;
  background-color: #fff;
}

.total-price {
  font-size: 16px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-price .price {
  color: #ff6b6b;
  font-size: 20px;
  font-weight: bold;
}

.checkout-btn {
  width: 100%;
  height: 44px;
  background: linear-gradient(to right, #ff6b6b, #ff4757);
  color: #fff;
  border: none;
  border-radius: 22px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
}

.checkout-btn:disabled {
  background: #e0e0e0;
  color: #999;
  cursor: not-allowed;
  box-shadow: none;
}

.checkout-btn:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

.checkout-btn:not(:disabled):active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
}

.empty-cart {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 