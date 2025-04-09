<template>
    <div class="container">
      <!-- 顶部搜索栏 -->
      <van-sticky>
        <van-search
          v-model="searchKey"
          placeholder="搜索菜品"
          shape="round"
          :style="{ background: 'var(--secondary-color)' }"
          class="tech-search"
        />
      </van-sticky>
  
      <!-- 主内容区 -->
      <div class="main-layout">
        <!-- 左侧分类导航 -->
        <van-sidebar v-model="activeCategory" class="category-nav" @change="scrollToCategory">
          <van-sidebar-item 
            v-for="(cat, index) in categories"
            :key="cat.id"
            :title="cat.name"
          />
        </van-sidebar>
  
        <!-- 右侧商品列表 -->
        <div class="goods-list">
          <div 
            v-for="cat in categories"
            :key="cat.id"
            class="category-section"
            :id="`category-${cat.id}`"
          >
            <h3 class="category-title">{{ cat.name }}</h3>
            <div 
              v-for="item in cat.items"
              :key="item.id"
              class="goods-card"
              @click="showSpecs(item)"
            >
              <van-image :src="item.image" width="88" height="88" radius="6" />
              <div class="goods-info">
                <div class="header">
                  <h4>{{ item.name }}</h4>
                  <van-icon v-if="item.isHot" name="fire" color="#ff5f16" />
                </div>
                <p class="desc">{{ item.desc }}</p>
                <div class="footer">
                  <span class="price">¥{{ currentPrice(item) }}</span>
                  <van-stepper
                    v-model="item.quantity"
                    theme="round"
                    button-size="24"
                    disable-input
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- 规格选择弹窗 -->
      <van-popup
        v-model:show="showSpecPopup"
        position="bottom"
        round
        class="spec-popup"
      >
        <div class="spec-content">
          <h3>{{ selectedItem?.name }}</h3>
          <div 
            v-for="(spec, index) in selectedItem?.specs"
            :key="index"
            class="spec-group"
          >
            <h4>{{ spec.name }}</h4>
            <div class="spec-options">
              <van-button
                v-for="(opt, oIndex) in spec.options"
                :key="oIndex"
                size="small"
                :type="activeSpecs[index] === oIndex ? 'primary' : 'default'"
                round
                @click="selectSpec(index, oIndex)"
              >
                {{ opt.name }}
                <span v-if="opt.price > 0">+¥{{ opt.price }}</span>
              </van-button>
            </div>
          </div>
          <van-button
            block
            type="primary"
            round
            class="confirm-spec"
            @click="confirmSpecs"
          >
            确认（¥{{ specTotalPrice }}）
          </van-button>
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
          <h3>已选商品（{{ cartTotal }}件）</h3>
          <div class="cart-items">
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
              <van-stepper
                v-model="item.quantity"
                theme="round"
                button-size="20"
                disable-input
              />
            </div>
          </div>
          <div class="cart-footer">
            <div class="total">
              合计：<span class="price">¥{{ totalPrice }}</span>
            </div>
            <van-button
              block
              type="primary"
              round
              class="confirm-btn"
              @click="handleCheckout"
            >
              去结算
            </van-button>
          </div>
        </div>
      </van-popup>
  
      <!-- 购物车入口 -->
      <div 
        v-if="cartTotal > 0"
        class="cart-entry"
        @click="showCartPanel = true"
      >
        <van-icon name="shopping-cart" :badge="cartTotal" />
        <!-- 调整模板中的金额显示 -->
        <span class="total-price">{{ formatPrice(totalPrice) }}</span>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  
  const activeCategory = ref(0)
  const searchKey = ref('')
  const showSpecPopup = ref(false)
  const showCartPanel = ref(false)
  const selectedItem = ref(null)
  const activeSpecs = ref([])
  
  // 商品数据结构
  import mockData from '../api/mock.json';

const categories = ref(mockData.categories.map(cat => ({
  ...cat,
  items: cat.items.map(item => ({
    ...item,
    quantity: 0,
    finalPrice: item.basePrice
  }))
})));
  
  // 当前商品价格计算
  const currentPrice = (item) => {
    return item.finalPrice || item.basePrice
  }
  
  // 分类导航切换
  const scrollToCategory = (index) => {
    const categoryElement = document.getElementById(`category-${categories.value[index].id}`);
    if (categoryElement) {
      categoryElement.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // 显示规格弹窗
  const showSpecs = (item) => {
    selectedItem.value = { ...item, quantity: 0 }
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
    selectedItem.value.quantity = 0
    
    // 更新原商品数据
    const categoryIndex = categories.value.findIndex(cat => 
      cat.items.some(i => i.id === selectedItem.value.id)
    )
    if (categoryIndex !== -1) {
      const itemIndex = categories.value[categoryIndex].items.findIndex(
        i => i.id === selectedItem.value.id
      )
      if (itemIndex !== -1) {
        categories.value[categoryIndex].items[itemIndex] = {
          ...selectedItem.value,
          quantity: 0
        }
      }
    }
    
    showSpecPopup.value = false
  }
  
  // 购物车相关计算
  // 添加金额格式化方法
  const formatPrice = (value) => {
    return '¥' + (value || 0).toFixed(2);
  };
  
  const totalPrice = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
  });
  
  // 修正购物车计算属性
  ;
  
  const cartItems = computed(() => {
    return categories.value
      .flatMap(cat => cat.items)
      .filter(item => item.quantity > 0 && item.finalPrice > 0);
  });
  
  // 调整总价计算逻辑
  ;
  
  const cartTotal = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
  })
  
  
  
  // 结算处理
  const handleCheckout = () => {
    console.log('提交订单', cartItems.value)
    showCartPanel.value = false
  }
  </script>
  
  <style scoped>
  /* 主布局 */
  .main-layout {
    display: flex;
    height: calc(100vh - 54px);
  }
  
  .category-nav {
    width: 100px;
    background: #f8f8f8;
    
    :deep(.van-sidebar-item) {
      padding: 16px 8px;
      &--select {
        color: #ff9d00;
        font-weight: 500;
        &::before {
          background-color: #ff9d00;
        }
      }
    }
  }
  
  .goods-list {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
  }
  
  .goods-card {
    display: flex;
    padding: 12px;
    margin-bottom: 8px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  
    .goods-info {
      flex: 1;
      margin-left: 12px;
  
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
  
        h4 {
          margin: 0;
          font-size: 15px;
          color: #333;
        }
  
        .van-icon {
          font-size: 18px;
        }
      }
  
      .desc {
        color: #999;
        font-size: 12px;
        margin: 4px 0;
      }
  
      .price {
        color: #ff5f16;
        font-size: 16px;
        font-weight: bold;
      }
    }
  }
  
  /* 规格弹窗 */
  .spec-popup {
    border-radius: 16px 16px 0 0;
  
    .spec-content {
      padding: 20px;
  
      h3 {
        margin: 0 0 20px;
        text-align: center;
      }
  
      .spec-group {
        margin-bottom: 20px;
  
        h4 {
          margin: 0 0 12px;
          color: #666;
        }
  
        .spec-options {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
  
          .van-button {
            font-size: 13px;
          }
        }
      }
  
      .confirm-spec {
        margin-top: 20px;
        background: linear-gradient(90deg, #0088ff, #0066cc);
        border: none;
      }
    }
  }
  
  /* 购物车面板 */
  .cart-popup {
    .cart-content {
      padding: 20px;
  
      h3 {
        margin: 0 0 16px;
      }
  
      .cart-items {
        max-height: 50vh;
        overflow-y: auto;
  
        .cart-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-top: 8px;
          gap: 12px;
        }
  
        .price {
          margin-right: auto;
          font-size: 14px;
        }
  
        :deep(.van-stepper) {
          --van-stepper-button-size: 18px;
          --van-stepper-input-width: 24px;
          margin-left: 8px;
        }
      }
    }
  }
  /* 购物车入口 */
  .cart-entry {
    position: fixed;
    right: 20px;
    bottom: 40px;
    display: flex;
    align-items: center;
    padding: 12px 20px;
    background: #0088ff;
    border-radius: 28px;
    color: white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 999;
  
    .van-icon {
      font-size: 24px;
    }
  
    .total-price {
      margin-left: 8px;
      font-weight: bold;
    }
  }
  </style>
