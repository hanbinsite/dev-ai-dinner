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
          @click="scrollToCategory(cat.id)"
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
          :id="`category-${cat.id}`"
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

// 滚动到指定分类
const scrollToCategory = (categoryId) => {
  const element = document.getElementById(`category-${categoryId}`)
  if (element) {
    const goodsList = document.querySelector('.goods-list')
    const offsetTop = element.offsetTop
    goodsList.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    })
    // 更新当前激活的分类索引
    activeCategory.value = categories.findIndex(cat => cat.id === categoryId)
  }
}

const handleScroll = () => {
  const goodsList = document.querySelector('.goods-list')
  const categoryElements = document.querySelectorAll('.category-section')
  const scrollTop = goodsList.scrollTop
  
  // 找到当前可见的分类
  let currentCategoryIndex = 0
  for (let i = 0; i < categoryElements.length; i++) {
    const element = categoryElements[i]
    const rect = element.getBoundingClientRect()
    const elementTop = rect.top + scrollTop
    
    if (elementTop <= scrollTop + 100) {
      currentCategoryIndex = i
    } else {
      break
    }
  }
  
  // 只有当分类真正改变时才更新
  if (activeCategory.value !== currentCategoryIndex) {
    activeCategory.value = currentCategoryIndex
  }
}

onMounted(() => {
  const goodsList = document.querySelector('.goods-list')
  if (goodsList) {
    goodsList.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  const goodsList = document.querySelector('.goods-list')
  if (goodsList) {
    goodsList.removeEventListener('scroll', handleScroll)
  }
})

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
});

const cartItemCount = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.quantity, 0);
});

const cartTotalPrice = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
});

const totalPrice = computed(() => {
  const total = cartItems.value.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
  return Number(total.toFixed(2));
})

// 结算处理
const handleCheckout = () => {
  console.log('提交订单', cartItems.value)
  router.push('/orders')
}

// 监听搜索框输入
const handleSearch = () => {
  // 重置当前激活的分类
  activeCategory.value = 0
  // 滚动到顶部
  if (goodsListRef.value) {
    goodsListRef.value.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}
</script>

<style scoped>
.order-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 60px;
}

/* 顶部导航栏 */
.header {
  background-color: #ffffff;
  padding: 10px 15px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

.table-info {
  display: flex;
  align-items: center;
  white-space: nowrap;
  min-width: 100px;
}

.table-label {
  font-size: 14px;
  color: #666;
}

.table-number {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-left: 5px;
  background-color: #fff7f0;
  color: #ff5f16;
  padding: 2px 8px;
  border-radius: 4px;
}

.search-box {
  flex: 1;
  max-width: 200px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #eee;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  background-color: #f5f5f5;
}

.search-input:focus {
  border-color: #ff5f16;
  background-color: #ffffff;
}

/* 主内容区 */
.main-content {
  display: flex;
  margin-top: 60px;
  background-color: #ffffff;
  min-height: calc(100vh - 60px);
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.category-nav {
  width: 80px;
  background-color: #f8f8f8;
  overflow-y: auto;
  position: fixed;
  left: 0;
  top: 60px;
  bottom: 50px;
  z-index: 1;
}

.category-item {
  padding: 15px 10px;
  text-align: center;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #eee;
  position: relative;
  cursor: pointer;
  transition: all 0.3s;
}

.category-item.active {
  background-color: #ffffff;
  color: #ff5f16;
  font-weight: bold;
}

.category-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 16px;
  background-color: #ff5f16;
}

.goods-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  margin-left: 80px;
  height: calc(100vh - 110px);
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

.category-section {
  margin-bottom: 20px;
  padding-top: 10px;
}

.category-title {
  margin: 0 0 10px;
  font-size: 16px;
  color: #333;
  padding-left: 10px;
  border-left: 3px solid #ff5f16;
}

.goods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  padding: 0 10px;
}

.goods-item {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.goods-item:hover {
  transform: translateY(-2px);
}

.goods-image {
  position: relative;
  padding-top: 75%;
}

.goods-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hot-tag {
  position: absolute;
  top: 5px;
  right: 5px;
  background: #ff5f16;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
}

.goods-info {
  padding: 10px;
}

.goods-name {
  margin: 0;
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.goods-desc {
  margin: 5px 0;
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.goods-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px;
}

.price {
  font-size: 16px;
  color: #ff5f16;
  font-weight: bold;
}

.add-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ff5f16;
  color: white;
  border: none;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.add-btn:active {
  transform: scale(0.95);
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.quantity-btn.minus {
  background: #f5f5f5;
  color: #666;
}

.quantity-btn.plus {
  background: #ff5f16;
  color: white;
}

.quantity-btn:active {
  transform: scale(0.95);
}

.quantity {
  font-size: 14px;
  min-width: 20px;
  text-align: center;
}

/* 购物车入口 */
.cart-entry {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  background-color: #333;
  color: white;
  padding: 10px 15px;
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
  background: #ff5f16;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.cart-info {
  flex: 1;
}

.cart-price {
  font-size: 16px;
  font-weight: bold;
}

.checkout-btn {
  padding: 8px 20px;
  background: #ff5f16;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.checkout-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 规格弹窗 */
.spec-popup {
  border-radius: 16px 16px 0 0;
}

.spec-content {
  padding: 20px;
}

.spec-header {
  display: flex;
  margin-bottom: 20px;
  position: relative;
}

.spec-info {
  margin-left: 15px;
  flex: 1;
}

.spec-info h3 {
  margin: 0 0 8px;
  font-size: 16px;
}

.spec-header .van-icon {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 20px;
  color: #999;
}

.spec-group {
  margin-bottom: 20px;
}

.spec-group h4 {
  margin: 0 0 12px;
  color: #666;
  font-size: 14px;
}

.spec-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.spec-option {
  padding: 8px 12px;
  border-radius: 16px;
  background-color: #f5f5f5;
  font-size: 13px;
  color: #333;
  display: flex;
  align-items: center;
}

.spec-option.active {
  background-color: #fff7f0;
  color: #ff5f16;
  border: 1px solid #ff5f16;
}

.option-price {
  margin-left: 5px;
  color: #ff5f16;
}

.spec-footer {
  margin-top: 20px;
}

.confirm-spec {
  background: linear-gradient(90deg, #ff5f16, #ff8c00);
  border: none;
}

/* 购物车面板 */
.cart-popup {
  border-radius: 16px 16px 0 0;
}

.cart-content {
  padding: 20px;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.cart-header h3 {
  margin: 0;
  font-size: 16px;
}

.empty-cart {
  padding: 30px 0;
}

.cart-items {
  max-height: 50vh;
  overflow-y: auto;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.cart-item .info {
  flex: 1;
}

.cart-item h4 {
  margin: 0 0 5px;
  font-size: 14px;
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

.quantity-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.quantity-btn.minus {
  background: #f5f5f5;
  color: #666;
}

.quantity-btn.plus {
  background: #ff5f16;
  color: white;
}

.quantity-btn:active {
  transform: scale(0.95);
}

.quantity {
  font-size: 14px;
  min-width: 20px;
  text-align: center;
}

.cart-footer {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f5f5f5;
}

.total-info {
  margin-bottom: 15px;
}

.total-price {
  font-size: 16px;
  margin-bottom: 5px;
}

.checkout-btn {
  background: linear-gradient(90deg, #ff5f16, #ff8c00);
  border: none;
}
</style> 