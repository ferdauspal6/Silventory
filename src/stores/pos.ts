import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PosCartItem } from '@/types'

export const usePosStore = defineStore('pos', () => {
  const selectedWarehouseId = ref('')
  const cart = ref<PosCartItem[]>([])
  const globalDiscount = ref<{ type: 'percent' | 'fixed' | ''; value: number; amount: number }>({
    type: '',
    value: 0,
    amount: 0,
  })

  const subtotal = computed(() =>
    cart.value.reduce((sum, item) => sum + item.subtotal, 0)
  )

  const totalDiscount = computed(() => {
    const itemDiscounts = cart.value.reduce((sum, item) => sum + item.discount_amount, 0)
    return itemDiscounts + globalDiscount.value.amount
  })

  const grandTotal = computed(() => Math.max(0, subtotal.value - globalDiscount.value.amount))

  const itemCount = computed(() =>
    cart.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  function addItem(item: { id: string; name: string; code: string; price: number; stock_available: number }) {
    const existing = cart.value.find(c => c.item_id === item.id)
    if (existing) {
      existing.quantity = Math.min(existing.quantity + 1, existing.stock_available)
      recalcItem(existing)
    } else {
      cart.value.push({
        item_id: item.id,
        name: item.name,
        code: item.code,
        price: item.price,
        quantity: 1,
        stock_available: item.stock_available,
        discount_type: '',
        discount_value: 0,
        discount_amount: 0,
        subtotal: item.price,
      })
    }
  }

  function removeItem(itemId: string) {
    const idx = cart.value.findIndex(c => c.item_id === itemId)
    if (idx !== -1) cart.value.splice(idx, 1)
  }

  function updateQty(itemId: string, qty: number) {
    const item = cart.value.find(c => c.item_id === itemId)
    if (!item) return
    item.quantity = Math.max(1, Math.min(qty, item.stock_available))
    recalcItem(item)
  }

  function setItemDiscount(itemId: string, type: 'percent' | 'fixed' | '', value: number) {
    const item = cart.value.find(c => c.item_id === itemId)
    if (!item) return
    item.discount_type = type
    item.discount_value = value
    recalcItem(item)
  }

  function setGlobalDiscount(type: 'percent' | 'fixed' | '', value: number) {
    globalDiscount.value.type = type
    globalDiscount.value.value = value
    if (type === 'percent') {
      globalDiscount.value.amount = subtotal.value * (value / 100)
    } else if (type === 'fixed') {
      globalDiscount.value.amount = value
    } else {
      globalDiscount.value.amount = 0
    }
  }

  function recalcItem(item: PosCartItem) {
    const lineTotal = item.price * item.quantity
    if (item.discount_type === 'percent') {
      item.discount_amount = lineTotal * (item.discount_value / 100)
    } else if (item.discount_type === 'fixed') {
      item.discount_amount = item.discount_value
    } else {
      item.discount_amount = 0
    }
    item.subtotal = Math.max(0, lineTotal - item.discount_amount)
  }

  function clearCart() {
    cart.value = []
    globalDiscount.value = { type: '', value: 0, amount: 0 }
  }

  function setWarehouse(id: string) {
    selectedWarehouseId.value = id
  }

  return {
    selectedWarehouseId,
    cart,
    globalDiscount,
    subtotal,
    totalDiscount,
    grandTotal,
    itemCount,
    addItem,
    removeItem,
    updateQty,
    setItemDiscount,
    setGlobalDiscount,
    clearCart,
    setWarehouse,
  }
})
