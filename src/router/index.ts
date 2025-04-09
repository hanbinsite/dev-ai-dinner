import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import MenuPage from '../views/MenuPage.vue'
import ScanPage from '../views/ScanPage.vue'
import OrdersPage from '../views/OrdersPage.vue'
import ScanSuccess from '../views/ScanSuccess.vue'
import OrderPage from '../views/OrderPage.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/menu', component: MenuPage },
    { path: '/scan', component: ScanPage },
    { path: '/orders', component: OrdersPage },
    { path: '/scan-success', component: ScanSuccess },
    { path: '/order', component: OrderPage }
  ]
})