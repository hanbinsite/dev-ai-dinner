import { defineStore } from 'pinia'

export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  selectedOptions: Record<string, any>
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[]
  }),
  actions: {
    addItem(item: CartItem) {
      const existing = this.items.find(i => i.id === item.id)
      existing ? existing.quantity += item.quantity : this.items.push(item)
    },
    removeItem(id: number) {
      this.items = this.items.filter(item => item.id !== id)
    },
    updateQuantity(id: number, quantity: number) {
      const item = this.items.find(i => i.id === id)
      if (item) item.quantity = quantity
    },
    clearCart() {
      this.items = []
    }
  },
  getters: {
    total: (state) => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }
})