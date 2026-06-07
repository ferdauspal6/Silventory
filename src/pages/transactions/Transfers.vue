<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { apiService } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import { Button, Input, Badge } from '@/components/ui'
import { Loader2, Plus, Pencil, Trash2, Search, Eye, Check, X } from '@lucide/vue'

const auth = useAuthStore()
const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const searchQuery = ref('')
const transfers = ref<any[]>([])
const warehouses = ref<any[]>([])
const items = ref<any[]>([])

const showDialog = ref(false)
const editing = ref(false)
const detailItem = ref<any>(null)

const form = ref<{
  id?: string
  from_warehouse_id: string
  to_warehouse_id: string
  transfer_date: string
  notes: string
  details: { item_id: string; quantity: number; notes: string }[]
}>({
  from_warehouse_id: '',
  to_warehouse_id: '',
  transfer_date: new Date().toISOString().split('T')[0],
  notes: '',
  details: [],
})

onMounted(async () => {
  loading.value = true
  try {
    const [tRes, wRes, iRes] = await Promise.all([
      apiService.getTransfers(),
      apiService.getWarehouses(),
      apiService.getItems(),
    ])
    if (tRes.success) transfers.value = tRes.data as any[]
    if (wRes.success) warehouses.value = wRes.data as any[]
    if (iRes.success) items.value = iRes.data as any[]
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

const filteredTransfers = computed(() => {
  if (!searchQuery.value) return transfers.value
  const q = searchQuery.value.toLowerCase()
  return transfers.value.filter((t: any) =>
    [t.transfer_number, t.from_warehouse_name, t.to_warehouse_name, t.transferred_by]
      .some((f) => f?.toLowerCase().includes(q))
  )
})

function getWarehouseName(id: string) {
  return warehouses.value.find((w: any) => w.id === id)?.name || id
}

function getItemName(id: string) {
  return items.value.find((i: any) => i.id === id)?.name || id
}

function openCreate() {
  editing.value = false
  form.value = {
    from_warehouse_id: '',
    to_warehouse_id: '',
    transfer_date: new Date().toISOString().split('T')[0],
    notes: '',
    details: [],
  }
  showDialog.value = true
}

function openEdit(transfer: any) {
  editing.value = true
  form.value = {
    id: transfer.id,
    from_warehouse_id: transfer.from_warehouse_id || '',
    to_warehouse_id: transfer.to_warehouse_id || '',
    transfer_date: transfer.transfer_date?.split('T')[0] || '',
    notes: transfer.notes || '',
    details: [],
  }
  showDialog.value = true
}

function addDetail() {
  form.value.details.push({ item_id: '', quantity: 0, notes: '' })
}

function removeDetail(index: number) {
  form.value.details.splice(index, 1)
}

function closeDialog() {
  showDialog.value = false
}

async function handleSave() {
  submitting.value = true
  error.value = ''
  try {
    let res: any
    if (editing.value) {
      res = await apiService.updateTransfer({
        id: form.value.id!,
        from_warehouse_id: form.value.from_warehouse_id,
        to_warehouse_id: form.value.to_warehouse_id,
        transfer_date: form.value.transfer_date,
        notes: form.value.notes,
      })
    } else {
      res = await apiService.createTransfer({
        from_warehouse_id: form.value.from_warehouse_id,
        to_warehouse_id: form.value.to_warehouse_id,
        transfer_date: form.value.transfer_date,
        transferred_by: auth.user?.id,
        notes: form.value.notes,
        details: form.value.details,
      })
    }
    if (!res.success) throw new Error(res.message)
    closeDialog()
    await fetchTransfers()
  } catch (e: any) {
    error.value = e.message
  } finally {
    submitting.value = false
  }
}

async function fetchTransfers() {
  try {
    const res = await apiService.getTransfers()
    if (res.success) transfers.value = res.data as any[]
  } catch (e: any) {
    error.value = e.message
  }
}

async function handleConfirm(id: string) {
  if (!confirm('Yakin ingin mengonfirmasi transfer ini? Stok akan dipindahkan secara otomatis.')) return
  try {
    const res = await apiService.confirmTransfer(id, auth.user?.id)
    if (!res.success) throw new Error(res.message)
    await fetchTransfers()
  } catch (e: any) {
    error.value = e.message
  }
}

async function handleDelete(id: string) {
  if (!confirm('Yakin ingin menghapus transfer ini?')) return
  try {
    const res = await apiService.deleteTransfer(id)
    if (!res.success) throw new Error(res.message)
    await fetchTransfers()
  } catch (e: any) {
    error.value = e.message
  }
}

async function viewDetail(transfer: any) {
  try {
    const res = await apiService.getTransferById(transfer.id)
    if (res.success) {
      detailItem.value = res.data
    } else {
      detailItem.value = transfer
    }
  } catch {
    detailItem.value = transfer
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <div class="relative w-64">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input v-model="searchQuery" placeholder="Cari transfer..." class="pl-9" />
      </div>
      <Button @click="openCreate()">
        <Plus class="h-4 w-4 mr-1" /> Tambah
      </Button>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <Loader2 class="h-6 w-6 animate-spin text-gray-400" />
    </div>
    <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 mb-4">{{ error }}</div>
    <div v-else class="rounded-lg border bg-white overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b bg-gray-50 text-left text-sm font-medium text-gray-500">
            <th class="px-4 py-3">No. Transfer</th>
            <th class="px-4 py-3">Dari Gudang</th>
            <th class="px-4 py-3">Ke Gudang</th>
            <th class="px-4 py-3">Ditransfer Oleh</th>
            <th class="px-4 py-3">Tanggal</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in filteredTransfers" :key="t.id" class="border-b last:border-0 hover:bg-gray-50">
            <td class="px-4 py-3 text-sm font-medium">{{ t.transfer_number || '-' }}</td>
            <td class="px-4 py-3 text-sm text-gray-500">{{ getWarehouseName(t.from_warehouse_id) }}</td>
            <td class="px-4 py-3 text-sm text-gray-500">{{ getWarehouseName(t.to_warehouse_id) }}</td>
            <td class="px-4 py-3 text-sm">{{ t.transferred_by || '-' }}</td>
            <td class="px-4 py-3 text-sm">{{ t.transfer_date?.split('T')[0] || '-' }}</td>
            <td class="px-4 py-3">
              <Badge :variant="t.status === 'confirmed' ? 'success' : 'warning'">
                {{ t.status === 'confirmed' ? 'Terkonfirmasi' : 'Draft' }}
              </Badge>
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-1">
                <Button variant="ghost" size="icon" @click="viewDetail(t)"><Eye class="h-4 w-4" /></Button>
                <Button v-if="t.status === 'draft'" variant="ghost" size="icon" @click="openEdit(t)"><Pencil class="h-4 w-4" /></Button>
                <Button v-if="t.status === 'draft'" variant="ghost" size="icon" class="text-green-600" @click="handleConfirm(t.id)"><Check class="h-4 w-4" /></Button>
                <Button v-if="t.status === 'draft'" variant="ghost" size="icon" class="text-red-500" @click="handleDelete(t.id)"><Trash2 class="h-4 w-4" /></Button>
              </div>
            </td>
          </tr>
          <tr v-if="!filteredTransfers.length">
            <td colspan="7" class="px-4 py-8 text-center text-sm text-gray-400">Tidak ada data</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Teleport to="body">
      <div v-if="showDialog" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="closeDialog">
        <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl mx-4 max-h-[90vh] overflow-y-auto">
          <h2 class="text-lg font-semibold mb-4">{{ editing ? 'Edit Transfer' : 'Tambah Transfer' }}</h2>
          <form @submit.prevent="handleSave" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-sm font-medium">Dari Gudang</label>
                <select v-model="form.from_warehouse_id" required
                  class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="" disabled>Pilih gudang</option>
                  <option v-for="w in warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
                </select>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium">Ke Gudang</label>
                <select v-model="form.to_warehouse_id" required
                  class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="" disabled>Pilih gudang</option>
                  <option v-for="w in warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
                </select>
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Tanggal Transfer</label>
              <Input v-model="form.transfer_date" type="date" required />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Catatan</label>
              <Input v-model="form.notes" />
            </div>

            <div v-if="!editing" class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium">Detail Item</label>
                <Button type="button" variant="outline" size="sm" @click="addDetail">
                  <Plus class="h-3 w-3 mr-1" /> Tambah Item
                </Button>
              </div>
              <div v-for="(d, i) in form.details" :key="i" class="flex items-start gap-2 rounded border p-2">
                <div class="flex-1 space-y-1">
                  <select v-model="d.item_id" required
                    class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <option value="" disabled>Pilih item</option>
                    <option v-for="item in items" :key="item.id" :value="item.id">{{ item.code }} - {{ item.name }}</option>
                  </select>
                </div>
                <div class="w-24 space-y-1">
                  <Input v-model.number="d.quantity" type="number" min="0" placeholder="Qty" required />
                </div>
                <div class="flex-1 space-y-1">
                  <Input v-model="d.notes" placeholder="Catatan" />
                </div>
                <Button type="button" variant="ghost" size="icon" class="mt-1 text-red-500 shrink-0" @click="removeDetail(i)">
                  <X class="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div v-if="error" class="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">{{ error }}</div>

            <div class="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" @click="closeDialog">Batal</Button>
              <Button type="submit" :disabled="submitting">
                <Loader2 v-if="submitting" class="mr-2 h-4 w-4 animate-spin" /> Simpan
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="detailItem" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="detailItem = null">
        <div class="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl mx-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold">Detail Transfer</h2>
            <Button variant="ghost" size="icon" @click="detailItem = null"><X class="h-4 w-4" /></Button>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span class="text-xs text-gray-500">No. Transfer</span>
              <p class="text-sm font-medium">{{ detailItem.transfer_number || '-' }}</p>
            </div>
            <div>
              <span class="text-xs text-gray-500">Status</span>
              <div class="mt-0.5">
                <Badge :variant="detailItem.status === 'confirmed' ? 'success' : 'warning'">
                  {{ detailItem.status === 'confirmed' ? 'Terkonfirmasi' : 'Draft' }}
                </Badge>
              </div>
            </div>
            <div>
              <span class="text-xs text-gray-500">Dari Gudang</span>
              <p class="text-sm">{{ getWarehouseName(detailItem.from_warehouse_id) }}</p>
            </div>
            <div>
              <span class="text-xs text-gray-500">Ke Gudang</span>
              <p class="text-sm">{{ getWarehouseName(detailItem.to_warehouse_id) }}</p>
            </div>
            <div>
              <span class="text-xs text-gray-500">Tanggal Transfer</span>
              <p class="text-sm">{{ detailItem.transfer_date?.split('T')[0] || '-' }}</p>
            </div>
            <div>
              <span class="text-xs text-gray-500">Ditransfer Oleh</span>
              <p class="text-sm">{{ detailItem.transferred_by || '-' }}</p>
            </div>
            <div class="col-span-2">
              <span class="text-xs text-gray-500">Catatan</span>
              <p class="text-sm">{{ detailItem.notes || '-' }}</p>
            </div>
          </div>

          <div v-if="detailItem.details?.length" class="rounded-lg border overflow-hidden">
            <table class="w-full">
              <thead>
                <tr class="border-b bg-gray-50 text-left text-xs font-medium text-gray-500">
                  <th class="px-3 py-2">Item</th>
                  <th class="px-3 py-2">Quantity</th>
                  <th class="px-3 py-2">Catatan</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="d in detailItem.details" :key="d.id" class="border-b last:border-0">
                  <td class="px-3 py-2 text-sm">{{ getItemName(d.item_id) }}</td>
                  <td class="px-3 py-2 text-sm">{{ d.quantity }}</td>
                  <td class="px-3 py-2 text-sm text-gray-500">{{ d.notes || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="text-sm text-gray-400">Tidak ada detail item</p>

          <div class="flex justify-end pt-4">
            <Button variant="outline" @click="detailItem = null">Tutup</Button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
