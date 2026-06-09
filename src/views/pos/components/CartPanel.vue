<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui'
import { Minus, Plus, Trash2, ShoppingCart, Percent, X } from '@lucide/vue'
import DiscountModal from './DiscountModal.vue'
import type { PosCartItem } from '@/types'

const props = defineProps<{
  cart: PosCartItem[]
  subtotal: number
  globalDiscount: { type: 'percent' | 'fixed' | ''; value: number; amount: number }
  grandTotal: number
  itemCount: number
}>()

const emit = defineEmits<{
  updateQty: [itemId: string, qty: number]
  removeItem: [itemId: string]
  setItemDiscount: [itemId: string, type: 'percent' | 'fixed' | '', value: number]
  setGlobalDiscount: [type: 'percent' | 'fixed' | '', value: number]
  openPayment: []
}>()

const discountModal = ref<{ open: boolean; target: string }>({ open: false, target: '' })

function openItemDiscount(itemId: string) {
  discountModal.value = { open: true, target: itemId }
}

function openGlobalDiscount() {
  discountModal.value = { open: true, target: 'global' }
}

function handleDiscountApply(type: 'percent' | 'fixed' | '', value: number) {
  if (discountModal.value.target === 'global') {
    emit('setGlobalDiscount', type, value)
  } else {
    emit('setItemDiscount', discountModal.value.target, type, value)
  }
}

function handleDiscountRemove() {
  if (discountModal.value.target === 'global') {
    emit('setGlobalDiscount', '', 0)
  } else {
    emit('setItemDiscount', discountModal.value.target, '', 0)
  }
}

function getCurrentDisc(): { type: 'percent' | 'fixed' | ''; value: number; amount: number } {
  if (discountModal.value.target === 'global') {
    return props.globalDiscount
  }
  const item = props.cart.find(c => c.item_id === discountModal.value.target)
  return { type: (item?.discount_type as 'percent' | 'fixed' | '') || '', value: item?.discount_value || 0, amount: item?.discount_amount || 0 }
}

function getLineTotal(item: PosCartItem) {
  return item.price * item.quantity
}
</script>

<template>
  <div class="flex flex-col h-full bg-[#0f1222]">
    <!-- Header -->
    <div class="p-4 border-b border-gray-800">
      <div class="flex items-center gap-3">
        <div class="h-10 w-10 rounded-lg bg-[#0ea5e9]/20 flex items-center justify-center">
          <ShoppingCart class="h-5 w-5 text-[#0ea5e9]" />
        </div>
        <div>
          <h2 class="text-white font-semibold">Keranjang</h2>
          <p class="text-xs text-gray-500">{{ itemCount }} item</p>
        </div>
      </div>
    </div>

    <!-- Cart Items -->
    <div class="flex-1 overflow-y-auto p-3 space-y-2">
      <div
        v-for="item in cart"
        :key="item.item_id"
        class="group rounded-xl bg-gray-800/50 border border-gray-700/50 p-3 transition-all hover:border-gray-600"
      >
        <div class="flex items-start justify-between mb-2">
          <div class="min-w-0 flex-1 mr-2">
            <div class="text-sm font-medium text-white truncate">{{ item.name }}</div>
            <div class="text-xs text-gray-500 font-mono">{{ item.code }}</div>
          </div>
          <button
            @click="emit('removeItem', item.item_id)"
            class="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
          >
            <X class="h-3.5 w-3.5" />
          </button>
        </div>

        <div class="flex items-center justify-between">
          <!-- Qty controls -->
          <div class="flex items-center gap-1">
            <button
              @click="emit('updateQty', item.item_id, item.quantity - 1)"
              class="h-8 w-8 rounded-lg bg-gray-700/50 flex items-center justify-center text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <Minus class="h-3.5 w-3.5" />
            </button>
            <input
              :value="item.quantity"
              @change="(e: any) => emit('updateQty', item.item_id, Number(e.target.value))"
              type="number"
              min="1"
              :max="item.stock_available"
              class="h-8 w-12 rounded-lg bg-transparent text-center text-sm font-medium text-white border-none outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              @click="emit('updateQty', item.item_id, item.quantity + 1)"
              class="h-8 w-8 rounded-lg bg-gray-700/50 flex items-center justify-center text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <Plus class="h-3.5 w-3.5" />
            </button>
          </div>

          <!-- Price + Discount -->
          <div class="text-right">
            <div class="text-sm font-bold text-white">
              {{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.subtotal) }}
            </div>
            <div class="flex items-center gap-1 justify-end">
              <span class="text-xs text-gray-500">{{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.price) }}/item</span>
              <button
                @click="openItemDiscount(item.item_id)"
                class="p-0.5 rounded"
                :class="item.discount_type ? 'text-[#0ea5e9]' : 'text-gray-500 hover:text-gray-300'"
              >
                <Percent class="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!cart.length" class="flex flex-col items-center justify-center py-12 text-gray-500">
        <ShoppingCart class="h-10 w-10 mb-2 opacity-30" />
        <p class="text-sm">Keranjang kosong</p>
        <p class="text-xs text-gray-600 mt-1">Klik item untuk menambah</p>
      </div>
    </div>

    <!-- Footer summary -->
    <div class="border-t border-gray-800 p-4 space-y-3">
      <div class="flex items-center justify-between text-sm text-gray-400">
        <span>Subtotal</span>
        <span>{{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(subtotal) }}</span>
      </div>

      <!-- Global Discount -->
      <div class="flex items-center justify-between text-sm">
        <button
          @click="openGlobalDiscount()"
          class="flex items-center gap-1.5 text-gray-400 hover:text-[#0ea5e9] transition-colors"
          :class="globalDiscount.type ? 'text-[#0ea5e9]' : ''"
        >
          <Percent class="h-3.5 w-3.5" />
          <span>Diskon</span>
        </button>
        <div v-if="globalDiscount.type" class="flex items-center gap-2">
          <span class="text-green-400 font-medium">
            -{{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(globalDiscount.amount) }}
          </span>
          <button @click="emit('setGlobalDiscount', '', 0)" class="p-0.5 text-gray-500 hover:text-red-400">
            <X class="h-3 w-3" />
          </button>
        </div>
      </div>

      <!-- Total -->
      <div class="flex items-center justify-between pt-2 border-t border-gray-800">
        <span class="text-base font-semibold text-white">Total</span>
        <span class="text-2xl font-bold text-[#0ea5e9] transition-all duration-300">
          {{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(grandTotal) }}
        </span>
      </div>

      <Button
        class="w-full h-12 text-base font-semibold bg-[#0ea5e9] hover:bg-[#0284c7] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        :disabled="!cart.length"
        @click="emit('openPayment')"
      >
        Proses Pembayaran
      </Button>
    </div>

    <!-- Discount Modal -->
    <DiscountModal
      :open="discountModal.open"
      :currentType="getCurrentDisc().type"
      :currentValue="getCurrentDisc().value"
      @close="discountModal.open = false"
      @apply="handleDiscountApply"
      @remove="handleDiscountRemove"
    />
  </div>
</template>
