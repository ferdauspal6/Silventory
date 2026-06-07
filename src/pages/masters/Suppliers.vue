<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useCrud } from '@/composables/useCrud'
import { useFormDialog } from '@/composables/useFormDialog'
import { apiService } from '@/lib/api'
import { Button, Input, Badge } from '@/components/ui'
import { Loader2, Plus, Pencil, Trash2, Search } from '@lucide/vue'

const { items, loading, error, fetchData, createItem, updateItem, deleteItem } = useCrud(
  apiService.getSuppliers,
  apiService.createSupplier,
  apiService.updateSupplier,
  apiService.deleteSupplier,
)

const dialog = useFormDialog({
  id: '', code: '', name: '', contact_person: '', phone: '', email: '', address: '',
})
const searchQuery = ref('')

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
      contact_person: dialog.form.contact_person, phone: dialog.form.phone,
      email: dialog.form.email, address: dialog.form.address,
    }
    if (dialog.editing.value) {
      await updateItem(dialog.form.id, payload)
    } else {
      await createItem(payload)
    }
    dialog.close()
  } finally {
    dialog.submitting.value = false
  }
}

async function handleDelete(id: string) {
  if (confirm('Hapus supplier ini?')) await deleteItem(id)
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <div class="relative w-64">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input v-model="searchQuery" placeholder="Cari supplier..." class="pl-9" />
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
            <th class="px-4 py-3">PIC</th>
            <th class="px-4 py-3">Telepon</th>
            <th class="px-4 py-3">Email</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredItems" :key="item.id" class="border-b last:border-0 hover:bg-gray-50">
            <td class="px-4 py-3 text-sm font-mono">{{ item.code }}</td>
            <td class="px-4 py-3 text-sm font-medium">{{ item.name }}</td>
            <td class="px-4 py-3 text-sm text-gray-500">{{ item.contact_person || '-' }}</td>
            <td class="px-4 py-3 text-sm text-gray-500">{{ item.phone || '-' }}</td>
            <td class="px-4 py-3 text-sm text-gray-500">{{ item.email || '-' }}</td>
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
        <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl mx-4 max-h-[90vh] overflow-y-auto">
          <h2 class="text-lg font-semibold mb-4">{{ dialog.editing.value ? 'Edit Supplier' : 'Tambah Supplier' }}</h2>
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
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-sm font-medium">PIC</label>
                <Input v-model="dialog.form.contact_person" />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium">Telepon</label>
                <Input v-model="dialog.form.phone" />
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Email</label>
              <Input v-model="dialog.form.email" type="email" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Alamat</label>
              <Input v-model="dialog.form.address" />
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
