<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useCrud } from '@/composables/useCrud'
import { useFormDialog } from '@/composables/useFormDialog'
import { apiService } from '@/lib/api'
import { Button, Input, Badge } from '@/components/ui'
import { Loader2, Plus, Pencil, Trash2, Search } from '@lucide/vue'

const { items, loading, error, fetchData, createItem, updateItem, deleteItem } = useCrud(
  apiService.getUnits,
  apiService.createUnit,
  apiService.updateUnit,
  apiService.deleteUnit,
)

const dialog = useFormDialog({ id: '', name: '', abbreviation: '' })
const searchQuery = ref('')

onMounted(() => fetchData())

const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value
  const q = searchQuery.value.toLowerCase()
  return items.value.filter((i: any) => i.name?.toLowerCase().includes(q) || i.abbreviation?.toLowerCase().includes(q))
})

async function handleSave() {
  dialog.submitting.value = true
  try {
    if (dialog.editing.value) {
      await updateItem(dialog.form.id, { name: dialog.form.name, abbreviation: dialog.form.abbreviation })
    } else {
      await createItem({ name: dialog.form.name, abbreviation: dialog.form.abbreviation })
    }
    dialog.close()
  } finally {
    dialog.submitting.value = false
  }
}

async function handleDelete(id: string) {
  if (confirm('Hapus satuan ini?')) await deleteItem(id)
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <div class="relative w-64">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input v-model="searchQuery" placeholder="Cari satuan..." class="pl-9" />
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
            <th class="px-4 py-3">Nama</th>
            <th class="px-4 py-3">Singkatan</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredItems" :key="item.id" class="border-b last:border-0 hover:bg-gray-50">
            <td class="px-4 py-3 text-sm font-medium">{{ item.name }}</td>
            <td class="px-4 py-3 text-sm text-gray-500">{{ item.abbreviation || '-' }}</td>
            <td class="px-4 py-3">
              <Badge :variant="item.is_active ? 'default' : 'secondary'">{{ item.is_active ? 'Aktif' : 'Nonaktif' }}</Badge>
            </td>
            <td class="px-4 py-3 text-right">
              <Button variant="ghost" size="icon" @click="dialog.openEdit(item)"><Pencil class="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" class="text-red-500" @click="handleDelete(item.id)"><Trash2 class="h-4 w-4" /></Button>
            </td>
          </tr>
          <tr v-if="!filteredItems.length">
            <td colspan="4" class="px-4 py-8 text-center text-sm text-gray-400">Tidak ada data</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Teleport to="body">
      <div v-if="dialog.open.value" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="dialog.close()">
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl mx-4">
          <h2 class="text-lg font-semibold mb-4">{{ dialog.editing.value ? 'Edit Satuan' : 'Tambah Satuan' }}</h2>
          <form @submit.prevent="handleSave" class="space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">Nama</label>
              <Input v-model="dialog.form.name" placeholder="pcs, kg, liter, box" required />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Singkatan</label>
              <Input v-model="dialog.form.abbreviation" placeholder="pcs, kg, L" required />
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
