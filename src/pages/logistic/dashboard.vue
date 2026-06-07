<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Truck, Package, Warehouse, ArrowUpDown } from '@lucide/vue'

const stats = [
  { label: 'Total Item', value: '1.247', icon: Package, change: '+23', positive: true },
  { label: 'Gudang Aktif', value: '4', icon: Warehouse, change: '0', positive: true },
  { label: 'PPB Menunggu', value: '8', icon: ArrowUpDown, change: '+3', positive: false },
  { label: 'Pengiriman Hari Ini', value: '5', icon: Truck, change: '+2', positive: true },
]
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Dashboard Logistik</h1>
      <p class="text-gray-500 mt-1">Manajemen inventory dan pengiriman</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card v-for="stat in stats" :key="stat.label" class="bg-white">
        <CardContent class="p-5 flex items-center gap-4">
          <div class="rounded-lg bg-blue-100 p-3">
            <component :is="stat.icon" class="h-6 w-6 text-primary" />
          </div>
          <div>
            <p class="text-sm text-gray-500">{{ stat.label }}</p>
            <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <Card class="bg-white">
      <CardHeader>
        <CardTitle>Logistik</CardTitle>
      </CardHeader>
      <CardContent>
        <p class="text-gray-500">Fitur logistik akan segera tersedia.</p>
      </CardContent>
    </Card>
  </div>
</template>
