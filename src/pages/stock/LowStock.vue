<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { apiService } from '@/lib/api'
import { Badge } from '@/components/ui'
import { Loader2, AlertTriangle } from '@lucide/vue'

const items = ref<any[]>([])
const loading = ref(false)
const error = ref('')

onMounted(async () => {
  loading.value = true
  try {
    const res = await apiService.getLowStock()
    if (res.success) items.value = res.data as any[]
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Loader2 class="h-6 w-6 animate-spin text-gray-400" />
    </div>
    <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{{ error }}</div>
    <div v-else>
      <div v-if="items.length" class="rounded-lg border bg-white overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="border-b bg-gray-50 text-left text-sm font-medium text-gray-500">
              <th class="px-4 py-3">Kode</th>
              <th class="px-4 py-3">Nama Item</th>
              <th class="px-4 py-3">Total Stock</th>
              <th class="px-4 py-3">Min Stock</th>
              <th class="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id" class="border-b last:border-0 hover:bg-gray-50">
              <td class="px-4 py-3 text-sm font-mono">{{ item.code }}</td>
              <td class="px-4 py-3 text-sm font-medium">{{ item.name }}</td>
              <td class="px-4 py-3 text-sm font-bold text-red-600">{{ item.total_stock }}</td>
              <td class="px-4 py-3 text-sm">{{ item.min_stock }}</td>
              <td class="px-4 py-3">
                <Badge variant="destructive" class="flex items-center gap-1 w-fit">
                  <AlertTriangle class="h-3 w-3" /> Di Bawah Minimum
                </Badge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="rounded-lg border bg-white p-8 text-center text-sm text-gray-400">
        Semua item memiliki stock yang mencukupi.
      </div>
    </div>
  </div>
</template>
