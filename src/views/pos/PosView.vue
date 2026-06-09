<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { apiService } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import { usePosStore } from '@/stores/pos'
import { usePos } from '@/composables/usePos'
import ProductGrid from './components/ProductGrid.vue'
import CartPanel from './components/CartPanel.vue'
import PaymentModal from './components/PaymentModal.vue'
import { Button } from '@/components/ui'
import { Package, LogOut, Store, Loader2, ShoppingCart } from '@lucide/vue'

const router = useRouter()
const auth = useAuthStore()
const store = usePosStore()
const { formatCurrency } = usePos()

const items = ref<any[]>([])
const categories = ref<any[]>([])
const warehouses = ref<any[]>([])
const loading = ref(true)
const selectedCategoryId = ref('')
const paymentOpen = ref(false)
const submittingPayment = ref(false)
const successOpen = ref(false)
const saleResult = ref<any>(null)

async function fetchData() {
  loading.value = true
  try {
    const [itemsRes, catsRes, whRes, stockRes] = await Promise.all([
      apiService.getItems('', 'true'),
      apiService.getCategories('true'),
      apiService.getWarehouses(),
      store.selectedWarehouseId ? apiService.getStock(store.selectedWarehouseId) : Promise.resolve({ success: true, data: [] }),
    ])
    if (itemsRes.success) {
      const allItems: any[] = itemsRes.data as any[]
      const stockData: any[] = stockRes.success ? (stockRes.data as any[]) : []
      items.value = allItems.map((item: any) => ({
        ...item,
        stock_available: stockData.find((s: any) => s.item_id === item.id)?.quantity || 0,
      }))
    }
    if (catsRes.success) categories.value = catsRes.data as any[]
    if (whRes.success) {
      warehouses.value = (whRes.data as any[]).filter((w: any) => w.type === 'warehouse' && w.is_active)
      if (!store.selectedWarehouseId && warehouses.value.length) {
        store.setWarehouse(warehouses.value[0].id)
      }
    }
  } catch (err: any) {
    console.error('Failed to load POS data:', err)
  } finally {
    loading.value = false
  }
}

async function refreshStock() {
  if (!store.selectedWarehouseId) return
  try {
    const stockRes = await apiService.getStock(store.selectedWarehouseId)
    const stockData: any[] = stockRes.success ? (stockRes.data as any[]) : []
    const allItems: any[] = items.value
    items.value = allItems.map((item: any) => ({
      ...item,
      stock_available: stockData.find((s: any) => s.item_id === item.id)?.quantity || 0,
    }))
  } catch (err) {
    console.error('Failed to refresh stock:', err)
  }
}

async function handleAddItem(item: any) {
  store.addItem(item)
}

async function handleCheckout(paidAmount: number) {
  submittingPayment.value = true
  try {
    const payload = {
      warehouse_id: store.selectedWarehouseId,
      cashier_id: auth.user?.id || '',
      details: store.cart.map(c => ({
        item_id: c.item_id,
        quantity: c.quantity,
        price_at_sale: c.price,
        discount_type: c.discount_type,
        discount_value: c.discount_value,
      })),
      discount_type: store.globalDiscount.type,
      discount_value: store.globalDiscount.value,
    }
    const res = await apiService.createSale(payload)
    if (res.success) {
      saleResult.value = res.data
      paymentOpen.value = false
      successOpen.value = true
      await refreshStock()
    }
  } catch (err: any) {
    alert(err.message || 'Gagal memproses pembayaran')
  } finally {
    submittingPayment.value = false
  }
}

function handleNewTransaction() {
  store.clearCart()
  successOpen.value = false
  saleResult.value = null
}

function handleExit() {
  router.push('/dashboard')
}

onMounted(() => {
  fetchData()
})

onUnmounted(() => {
  store.clearCart()
})
</script>

<template>
  <div class="h-screen w-screen overflow-hidden bg-[#0b0e1a]" @keydown="(e: KeyboardEvent) => {}">
    <!-- Header -->
    <header class="h-14 bg-[#111627] border-b border-gray-800 flex items-center justify-between px-4 shrink-0">
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <Package class="h-5 w-5 text-[#0ea5e9]" />
          <span class="font-bold text-white text-sm">Silventory POS</span>
        </div>
        <div class="h-5 w-px bg-gray-700" />
        <div class="flex items-center gap-2 text-xs text-gray-400">
          <Store class="h-3.5 w-3.5" />
          <select
            :value="store.selectedWarehouseId"
            @change="(e: any) => { store.setWarehouse(e.target.value); fetchData() }"
            class="bg-transparent border-none text-gray-300 text-xs font-medium outline-none cursor-pointer"
          >
            <option value="" disabled>Pilih Gudang</option>
            <option v-for="wh in warehouses" :key="wh.id" :value="wh.id">{{ wh.name }}</option>
          </select>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-xs text-gray-500">{{ auth.userName }}</span>
        <Button variant="ghost" size="sm" class="text-gray-400 hover:text-white h-8" @click="handleExit">
          <LogOut class="h-4 w-4" />
        </Button>
      </div>
    </header>

    <!-- Main content -->
    <div v-if="loading" class="flex items-center justify-center h-[calc(100vh-3.5rem)]">
      <Loader2 class="h-8 w-8 animate-spin text-[#0ea5e9]" />
    </div>

    <div v-else class="flex h-[calc(100vh-3.5rem)]">
      <!-- Product Grid (Left) -->
      <div class="flex-1 min-w-0">
        <ProductGrid
          :items="items"
          :categories="categories"
          :selectedCategoryId="selectedCategoryId"
          @addItem="handleAddItem"
          @selectCategory="(id: string) => selectedCategoryId = id"
        />
      </div>

      <!-- Cart Panel (Right) -->
      <div class="w-80 sm:w-96 lg:w-[420px] border-l border-gray-800 shrink-0 hidden sm:block">
        <CartPanel
          :cart="store.cart"
          :subtotal="store.subtotal"
          :globalDiscount="store.globalDiscount"
          :grandTotal="store.grandTotal"
          :itemCount="store.itemCount"
          @updateQty="store.updateQty"
          @removeItem="store.removeItem"
          @setItemDiscount="store.setItemDiscount"
          @setGlobalDiscount="store.setGlobalDiscount"
          @openPayment="paymentOpen = true"
        />
      </div>
    </div>

    <!-- Mobile cart button -->
    <div v-if="store.cart.length" class="sm:hidden fixed bottom-0 left-0 right-0 z-30 p-3">
      <button
        @click="paymentOpen = true"
        class="w-full h-12 rounded-xl bg-[#0ea5e9] text-white font-semibold text-base shadow-lg shadow-[#0ea5e9]/20 flex items-center justify-center gap-2"
      >
        <ShoppingCart class="h-5 w-5" />
        <span>Lihat Keranjang ({{ store.itemCount }})</span>
        <span>- {{ formatCurrency(store.grandTotal) }}</span>
      </button>
    </div>

    <!-- Payment Modal -->
    <PaymentModal
      :open="paymentOpen"
      :total="store.grandTotal"
      :subtotal="store.subtotal"
      :discountAmount="store.totalDiscount"
      :itemCount="store.itemCount"
      :submitting="submittingPayment"
      @close="paymentOpen = false"
      @confirm="handleCheckout"
      @newTransaction="handleNewTransaction"
    />

    <!-- Success Overlay -->
    <Teleport to="body">
      <div v-if="successOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div class="w-full max-w-sm rounded-xl bg-[#1a1f2e] border border-gray-700 p-8 shadow-2xl mx-4 text-center">
          <div class="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <svg class="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-white text-lg font-semibold mb-1">Transaksi Berhasil</h3>
          <p class="text-gray-400 text-sm mb-2">{{ saleResult?.sale_number }}</p>
          <div class="text-2xl font-bold text-[#0ea5e9] mb-6">
            {{ formatCurrency(saleResult?.total || 0) }}
          </div>
          <div class="flex gap-3 justify-center">
            <Button
              class="flex-1 bg-[#0ea5e9] hover:bg-[#0284c7] text-white h-11"
              @click="handleNewTransaction"
            >
              Transaksi Baru
            </Button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}
</style>
