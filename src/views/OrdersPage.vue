<template>
  <el-card class="order-list">
    <el-table :data="orders" style="width: 100%">
      <el-table-column prop="orderNo" label="订单号" width="180" />
      <el-table-column prop="createTime" label="下单时间" />
      <el-table-column prop="total" label="金额">
        <template #default="scope">
          ¥{{ scope.row.total }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <el-tag :type="statusType(scope.row.status)">
            {{ statusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="scope">
          <el-button link type="primary" @click="viewDetail(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
const orders = ref([
  {
    orderNo: '202308240001',
    createTime: '2023-08-24 12:30',
    total: 198,
    status: 1,
    items: [
      { name: '经典牛排', price: 98, quantity: 2 }
    ]
  }
])

const statusType = (status) => {
  const types = ['info', 'warning', 'success', 'danger']
  return types[status] || ''
}

const statusText = (status) => {
  const texts = ['待支付', '进行中', '已完成', '已取消']
  return texts[status] || ''
}

const viewDetail = (order) => {
  ElMessageBox.alert(
    `订单详情：
    ${order.items.map(item => `${item.name} x${item.quantity}`).join('\n')}`,
    `订单号：${order.orderNo}`
  )
}
</script>

<style scoped>
.order-list {
  margin: 20px;
  min-height: 500px;
}
</style>