<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Users, UserCheck, Clock, Briefcase } from '@lucide/vue'

const stats = [
  { label: 'Total Karyawan', value: '246', icon: Users, detail: 'Aktif: 238' },
  { label: 'Hadir Hari Ini', value: '198', icon: UserCheck, detail: '80.5% kehadiran' },
  { label: 'Pengajuan Cuti', value: '12', icon: Clock, detail: '5 pending' },
  { label: 'Lowongan Terbuka', value: '7', icon: Briefcase, detail: '3 urgent' },
]
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Dashboard HR & GA</h1>
      <p class="text-gray-500 mt-1">Manajemen sumber daya manusia dan general affairs</p>
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
            <p class="text-xs text-gray-400 mt-0.5">{{ stat.detail }}</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <Card class="bg-white">
      <CardHeader>
        <CardTitle>HR & GA</CardTitle>
      </CardHeader>
      <CardContent>
        <p class="text-gray-500">Fitur HR & GA akan segera tersedia.</p>
      </CardContent>
    </Card>
  </div>
</template>
