<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Wallet, TrendingUp, TrendingDown, Banknote, Receipt } from '@lucide/vue'

const stats = [
  { label: 'Total Aset', value: 'Rp 4,8M', icon: Banknote, change: '+5.2%', positive: true },
  { label: 'Pendapatan Bulan Ini', value: 'Rp 890Jt', icon: TrendingUp, change: '+12%', positive: true },
  { label: 'Pengeluaran', value: 'Rp 645Jt', icon: TrendingDown, change: '+8%', positive: false },
  { label: 'Jurnal Pending', value: '23', icon: Receipt, change: '-5', positive: true },
]
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Ringkasan Keuangan</h1>
      <p class="text-gray-500 mt-1">Overview kondisi keuangan Cita Group</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card v-for="stat in stats" :key="stat.label" class="bg-white">
        <CardContent class="p-5">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm text-gray-500">{{ stat.label }}</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ stat.value }}</p>
              <p class="text-sm font-medium mt-2" :class="stat.positive ? 'text-green-600' : 'text-red-600'">{{ stat.change }}</p>
            </div>
            <div class="rounded-lg bg-blue-100 p-2.5">
              <component :is="stat.icon" class="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <Card class="bg-white">
      <CardHeader>
        <CardTitle>Keuangan</CardTitle>
      </CardHeader>
      <CardContent>
        <p class="text-gray-500">Fitur keuangan akan segera tersedia.</p>
      </CardContent>
    </Card>
  </div>
</template>
