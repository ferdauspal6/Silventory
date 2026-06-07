<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { apiService } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import { Loader2, Package, Warehouse, AlertTriangle, ClipboardList, Box } from '@lucide/vue'

const auth = useAuthStore()
const summary = ref<any>({ total_items: 0, total_warehouses: 0, low_stock_count: 0, pending_transactions: 0 })
const recentActivity = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [sumRes, actRes] = await Promise.all([
      apiService.getDashboardSummary(),
      apiService.getRecentActivity(5),
    ])
    if (sumRes.success) summary.value = sumRes.data
    if (actRes.success) recentActivity.value = (actRes.data as any[]) || []
  } catch (_) {
  } finally {
    loading.value = false
  }
})

const stats = [
  { label: 'Total Item', value: summary.value.total_items, icon: Box, color: 'bg-blue-500' },
  { label: 'Total Gudang/Proyek', value: summary.value.total_warehouses, icon: Warehouse, color: 'bg-green-500' },
  { label: 'Stock Rendah', value: summary.value.low_stock_count, icon: AlertTriangle, color: 'bg-red-500' },
  { label: 'Transaksi Pending', value: summary.value.pending_transactions, icon: ClipboardList, color: 'bg-amber-500' },
]

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Baru saja'
  if (mins < 60) return `${mins} menit lalu`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  return `${days} hari lalu`
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-gray-800">Selamat datang, {{ auth.userName }}</h2>
      <p class="text-sm text-gray-500 mt-1">Ringkasan sistem inventory Anda</p>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <Loader2 class="h-6 w-6 animate-spin text-gray-400" />
    </div>
    <div v-else>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div v-for="stat in stats" :key="stat.label"
          class="rounded-lg border bg-white p-4 flex items-center gap-4">
          <div class="h-10 w-10 rounded-lg flex items-center justify-center" :class="stat.color">
            <component :is="stat.icon" class="h-5 w-5 text-white" />
          </div>
          <div>
            <div class="text-2xl font-bold">{{ stat.value }}</div>
            <div class="text-xs text-gray-500">{{ stat.label }}</div>
          </div>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <div class="rounded-lg border bg-white">
          <div class="px-4 py-3 border-b">
            <h3 class="font-semibold text-sm">Aktivitas Terbaru</h3>
          </div>
          <div v-if="recentActivity.length" class="divide-y">
            <div v-for="act in recentActivity" :key="act.id" class="px-4 py-3 text-sm">
              <div class="flex items-center justify-between">
                <span class="font-medium">{{ act.description || act.action }}</span>
                <span class="text-xs text-gray-400">{{ timeAgo(act.timestamp) }}</span>
              </div>
              <div class="text-xs text-gray-400 mt-0.5">
                {{ act.module }} · {{ act.action }}
              </div>
            </div>
          </div>
          <div v-else class="px-4 py-6 text-center text-sm text-gray-400">
            Belum ada aktivitas
          </div>
        </div>

        <div class="rounded-lg border bg-white p-6">
          <h3 class="font-semibold text-sm mb-3">Informasi Sistem</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">Versi</span>
              <span class="font-medium">1.0.0</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Role</span>
              <span class="font-medium capitalize">{{ auth.userRole }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Nama</span>
              <span class="font-medium">{{ auth.userName }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
