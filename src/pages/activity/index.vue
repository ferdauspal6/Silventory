<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { apiService } from '@/lib/api'
import { Loader2 } from '@lucide/vue'

const logs = ref<any[]>([])
const loading = ref(false)
const error = ref('')

onMounted(async () => {
  loading.value = true
  try {
    const res = await apiService.getRecentActivity(50)
    if (res.success) logs.value = (res.data as any[]) || []
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})

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

const actionColors: Record<string, string> = {
  CREATE: 'text-green-600 bg-green-50',
  UPDATE: 'text-blue-600 bg-blue-50',
  DELETE: 'text-red-600 bg-red-50',
  APPROVE: 'text-emerald-600 bg-emerald-50',
  REJECT: 'text-red-600 bg-red-50',
  CONFIRM: 'text-purple-600 bg-purple-50',
  LOGIN: 'text-gray-600 bg-gray-50',
  SUBMIT: 'text-amber-600 bg-amber-50',
}
</script>

<template>
  <div>
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Loader2 class="h-6 w-6 animate-spin text-gray-400" />
    </div>
    <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{{ error }}</div>
    <div v-else class="rounded-lg border bg-white overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b bg-gray-50 text-left text-sm font-medium text-gray-500">
            <th class="px-4 py-3">Waktu</th>
            <th class="px-4 py-3">Aksi</th>
            <th class="px-4 py-3">Modul</th>
            <th class="px-4 py-3">Deskripsi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log.id" class="border-b last:border-0 hover:bg-gray-50">
            <td class="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{{ timeAgo(log.timestamp) }}</td>
            <td class="px-4 py-3">
              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" :class="actionColors[log.action] || 'text-gray-600 bg-gray-50'">
                {{ log.action }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ log.module }}</td>
            <td class="px-4 py-3 text-sm">{{ log.description || '-' }}</td>
          </tr>
          <tr v-if="!logs.length">
            <td colspan="4" class="px-4 py-8 text-center text-sm text-gray-400">Belum ada aktivitas</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
