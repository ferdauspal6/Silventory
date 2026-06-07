<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { apiService } from '@/lib/api'
import { useFormDialog } from '@/composables/useFormDialog'
import { Button, Input, Badge } from '@/components/ui'
import { Loader2, Plus, Pencil, Trash2, Search } from '@lucide/vue'

const items = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')

const dialog = useFormDialog({
  id: '', code: '', name: '', type: 'warehouse', location: '', person_in_charge: '',
})

async function fetchData() {
  loading.value = true
  error.value = ''
  try {
    const res = await apiService.getWarehouses()
    if (res.success) items.value = res.data as any[]
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchData())

const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value
  const q = searchQuery.value.toLowerCase()
  return items.value.filter((i: any) =>
    i.name?.toLowerCase().includes(q) || i.code?.toLowerCase().includes(q)
  )
})

async function handleSave() {
  dialog.submitting.value = true
  try {
    const payload = {
      code: dialog.form.code, name: dialog.form.name,
      type: dialog.form.type, location: dialog.form.location,
      person_in_charge: dialog.form.person_in_charge,
    }
    if (dialog.editing.value) {
      await apiService.updateWarehouse({ id: dialog.form.id, ...payload })
    } else {
      await apiService.createWarehouse(payload)
    }
    dialog.close()
    await fetchData()
  } catch (err: any) {
    error.value = err.message
  } finally {
    dialog.submitting.value = false
  }
}

async function handleDelete(id: string) {
  if (confirm('Hapus gudang/proyek ini?')) {
    await apiService.deleteWarehouse(id)
    await fetchData()
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <div class="relative w-64">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input v-model="searchQuery" placeholder="Cari gudang/proyek..." class="pl-9" />
      </div>
      <Button @click="dialog.openCreate()">
        <Plus class="h-4 w-4 mr-1" /> Tambah
      </Button>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <Loader2 class="h-6 w-6 animate-spin text-gray-400" />
    </div>
    <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{{ error }}</div>
    <div v-else class="rounded-lg border bg-white overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b bg-gray-50 text-left text-sm font-medium text-gray-500">
            <th class="px-4 py-3">Kode</th>
            <th class="px-4 py-3">Nama</th>
            <th class="px-4 py-3">Tipe</th>
            <th class="px-4 py-3">Lokasi</th>
            <th class="px-4 py-3">PIC</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredItems" :key="item.id" class="border-b last:border-0 hover:bg-gray-50">
            <td class="px-4 py-3 text-sm font-mono">{{ item.code }}</td>
            <td class="px-4 py-3 text-sm font-medium">{{ item.name }}</td>
            <td class="px-4 py-3">
              <Badge :variant="item.type === 'warehouse' ? 'default' : 'secondary'">
                {{ item.type === 'warehouse' ? 'Gudang' : 'Proyek' }}
              </Badge>
            </td>
            <td class="px-4 py-3 text-sm text-gray-500">{{ item.location || '-' }}</td>
            <td class="px-4 py-3 text-sm text-gray-500">{{ item.person_in_charge || '-' }}</td>
            <td class="px-4 py-3">
              <Badge :variant="item.is_active ? 'default' : 'secondary'">{{ item.is_active ? 'Aktif' : 'Nonaktif' }}</Badge>
            </td>
            <td class="px-4 py-3 text-right">
              <Button variant="ghost" size="icon" @click="dialog.openEdit(item)"><Pencil class="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" class="text-red-500" @click="handleDelete(item.id)"><Trash2 class="h-4 w-4" /></Button>
            </td>
          </tr>
          <tr v-if="!filteredItems.length">
            <td colspan="7" class="px-4 py-8 text-center text-sm text-gray-400">Tidak ada data</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Teleport to="body">
      <div v-if="dialog.open.value" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="dialog.close()">
        <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl mx-4">
          <h2 class="text-lg font-semibold mb-4">{{ dialog.editing.value ? 'Edit Gudang/Proyek' : 'Tambah Gudang/Proyek' }}</h2>
          <form @submit.prevent="handleSave" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-sm font-medium">Kode</label>
                <Input v-model="dialog.form.code" required />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium">Nama</label>
                <Input v-model="dialog.form.name" required />
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Tipe</label>
              <select v-model="dialog.form.type" required
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <option value="warehouse">Gudang</option>
                <option value="project">Proyek</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Lokasi</label>
              <Input v-model="dialog.form.location" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">PIC</label>
              <Input v-model="dialog.form.person_in_charge" />
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" @click="dialog.close()">Batal</Button>
              <Button type="submit" :disabled="dialog.submitting.value">
                <Loader2 v-if="dialog.submitting.value" class="mr-2 h-4 w-4 animate-spin" /> Simpan
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
