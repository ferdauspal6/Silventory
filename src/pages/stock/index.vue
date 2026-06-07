<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { apiService } from '@/lib/api'
import { Input, Badge } from '@/components/ui'
import { Loader2, Search } from '@lucide/vue'

const stocks = ref<any[]>([])
const items = ref<any[]>([])
const warehouses = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const warehouseFilter = ref('')

async function fetchData() {
  loading.value = true
  error.value = ''
  try {
    const [stockRes, itemsRes, whRes] = await Promise.all([
      apiService.getStock(),
      apiService.getItems(),
      apiService.getWarehouses(),
    ])
    if (stockRes.success) stocks.value = stockRes.data as any[]
    if (itemsRes.success) items.value = itemsRes.data as any[]
    if (whRes.success) warehouses.value = whRes.data as any[]
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchData())

function getItem(id: string) { return items.value.find(i => i.id === id) }
function getWarehouse(id: string) { return warehouses.value.find(w => w.id === id) }

const filtered = computed(() => {
  let data = stocks.value
  if (warehouseFilter.value) {
    data = data.filter(s => s.warehouse_id === warehouseFilter.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    data = data.filter(s => {
      const item = getItem(s.item_id)
      return item?.name?.toLowerCase().includes(q) || item?.code?.toLowerCase().includes(q)
    })
  }
  return data
})
</script>

<template>
  <div>
    <div class="flex items-center gap-4 mb-4 flex-wrap">
      <div class="relative w-64">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input v-model="searchQuery" placeholder="Cari item..." class="pl-9" />
      </div>
      <select v-model="warehouseFilter"
        class="h-10 rounded-md border border-input bg-background px-3 text-sm">
        <option value="">Semua Lokasi</option>
        <option v-for="wh in warehouses" :key="wh.id" :value="wh.id">{{ wh.name }}</option>
      </select>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <Loader2 class="h-6 w-6 animate-spin text-gray-400" />
    </div>
    <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{{ error }}</div>
    <div v-else class="rounded-lg border bg-white overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b bg-gray-50 text-left text-sm font-medium text-gray-500">
            <th class="px-4 py-3">Item</th>
            <th class="px-4 py-3">Kode</th>
            <th class="px-4 py-3">Lokasi</th>
            <th class="px-4 py-3">Quantity</th>
            <th class="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in filtered" :key="s.id" class="border-b last:border-0 hover:bg-gray-50">
            <td class="px-4 py-3 text-sm font-medium">{{ getItem(s.item_id)?.name || s.item_id }}</td>
            <td class="px-4 py-3 text-sm font-mono text-gray-500">{{ getItem(s.item_id)?.code || '-' }}</td>
            <td class="px-4 py-3 text-sm text-gray-500">{{ getWarehouse(s.warehouse_id)?.name || s.warehouse_id }}</td>
            <td class="px-4 py-3 text-sm font-medium">{{ s.quantity }}</td>
            <td class="px-4 py-3">
              <Badge :variant="s.quantity <= (getItem(s.item_id)?.min_stock || 0) ? 'destructive' : 'default'">
                {{ s.quantity <= (getItem(s.item_id)?.min_stock || 0) ? 'Rendah' : 'Cukup' }}
              </Badge>
            </td>
          </tr>
          <tr v-if="!filtered.length">
            <td colspan="5" class="px-4 py-8 text-center text-sm text-gray-400">Tidak ada data stock</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
