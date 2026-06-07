<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { apiService } from '@/lib/api'
import { useFormDialog } from '@/composables/useFormDialog'
import { useAuthStore } from '@/stores/auth'
import { Button, Input, Badge } from '@/components/ui'
import { Loader2, Plus, Pencil, Trash2, Eye, Check, Search, X } from '@lucide/vue'

const auth = useAuthStore()

const receipts = ref<any[]>([])
const items = ref<any[]>([])
const suppliers = ref<any[]>([])
const warehouses = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')

const viewData = ref<any>(null)

const dialog = useFormDialog({
  id: '',
  supplier_id: '',
  warehouse_id: '',
  receipt_date: '',
  notes: '',
})

const detailRows = ref<any[]>([])

async function fetchData() {
  loading.value = true
  error.value = ''
  try {
    const [recRes, itemsRes, suppRes, whRes] = await Promise.all([
      apiService.getReceipts(),
      apiService.getItems(),
      apiService.getSuppliers(),
      apiService.getWarehouses(),
    ])
    if (recRes.success) receipts.value = recRes.data as any[]
    if (itemsRes.success) items.value = itemsRes.data as any[]
    if (suppRes.success) suppliers.value = suppRes.data as any[]
    if (whRes.success) warehouses.value = whRes.data as any[]
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchData())

function getSupplier(id: string) { return suppliers.value.find(s => s.id === id) }
function getWarehouse(id: string) { return warehouses.value.find(w => w.id === id) }
function getItem(id: string) { return items.value.find(i => i.id === id) }

const filteredReceipts = computed(() => {
  if (!searchQuery.value) return receipts.value
  const q = searchQuery.value.toLowerCase()
  return receipts.value.filter((r: any) => {
    const supp = getSupplier(r.supplier_id)
    return r.receipt_number?.toLowerCase().includes(q) || supp?.name?.toLowerCase().includes(q)
  })
})

async function handleView(id: string) {
  try {
    const res = await apiService.getReceiptById(id)
    if (res.success) viewData.value = res.data as any
  } catch (err: any) {
    error.value = err.message
  }
}

function openCreate() {
  dialog.openCreate()
  detailRows.value = [{ item_id: '', quantity_received: 0, notes: '' }]
}

function openEdit(receipt: any) {
  dialog.openEdit({
    id: receipt.id,
    supplier_id: receipt.supplier_id || '',
    warehouse_id: receipt.warehouse_id || '',
    receipt_date: receipt.receipt_date ? receipt.receipt_date.slice(0, 10) : '',
    notes: receipt.notes || '',
  })
  detailRows.value = receipt.details?.length
    ? receipt.details.map((d: any) => ({ item_id: d.item_id, quantity_received: d.quantity_received, notes: d.notes || '' }))
    : []
}

function addDetailRow() {
  detailRows.value.push({ item_id: '', quantity_received: 0, notes: '' })
}

function removeDetailRow(index: number) {
  detailRows.value.splice(index, 1)
}

async function handleSave() {
  dialog.submitting.value = true
  try {
    const header = {
      supplier_id: dialog.form.supplier_id,
      warehouse_id: dialog.form.warehouse_id,
      receipt_date: dialog.form.receipt_date,
      notes: dialog.form.notes,
    }
    if (dialog.editing.value) {
      await apiService.updateReceipt({ id: dialog.form.id, ...header })
    } else {
      await apiService.createReceipt({
        ...header,
        received_by: auth.user?.name || '',
        details: detailRows.value
          .filter((d: any) => d.item_id && d.quantity_received > 0)
          .map((d: any) => ({
            item_id: d.item_id,
            quantity_received: Number(d.quantity_received),
            notes: d.notes || '',
          })),
      })
    }
    dialog.close()
    await fetchData()
  } catch (err: any) {
    error.value = err.message
  } finally {
    dialog.submitting.value = false
  }
}

async function handleConfirm(id: string) {
  if (confirm('Konfirmasi penerimaan ini? Stok akan bertambah.')) {
    try {
      await apiService.confirmReceipt(id, auth.user?.id)
      await fetchData()
    } catch (err: any) {
      error.value = err.message
    }
  }
}

async function handleDelete(id: string) {
  if (confirm('Hapus penerimaan ini?')) {
    try {
      await apiService.deleteReceipt(id)
      await fetchData()
    } catch (err: any) {
      error.value = err.message
    }
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <div class="relative w-64">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input v-model="searchQuery" placeholder="Cari penerimaan..." class="pl-9" />
      </div>
      <Button @click="openCreate()">
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
            <th class="px-4 py-3">No. Receipt</th>
            <th class="px-4 py-3">Supplier</th>
            <th class="px-4 py-3">Warehouse</th>
            <th class="px-4 py-3">Diterima Oleh</th>
            <th class="px-4 py-3">Tgl. Terima</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in filteredReceipts" :key="r.id" class="border-b last:border-0 hover:bg-gray-50">
            <td class="px-4 py-3 text-sm font-mono font-medium">{{ r.receipt_number || '-' }}</td>
            <td class="px-4 py-3 text-sm">{{ getSupplier(r.supplier_id)?.name || r.supplier_id }}</td>
            <td class="px-4 py-3 text-sm text-gray-500">{{ getWarehouse(r.warehouse_id)?.name || r.warehouse_id }}</td>
            <td class="px-4 py-3 text-sm text-gray-500">{{ r.received_by || '-' }}</td>
            <td class="px-4 py-3 text-sm text-gray-500">{{ r.receipt_date ? new Date(r.receipt_date).toLocaleDateString('id-ID') : '-' }}</td>
            <td class="px-4 py-3">
              <Badge :variant="r.status === 'confirmed' ? 'success' : 'warning'">
                {{ r.status === 'confirmed' ? 'Confirmed' : 'Draft' }}
              </Badge>
            </td>
            <td class="px-4 py-3 text-right">
              <Button variant="ghost" size="icon" @click="handleView(r.id)"><Eye class="h-4 w-4" /></Button>
              <Button v-if="r.status !== 'confirmed'" variant="ghost" size="icon" @click="openEdit(r)"><Pencil class="h-4 w-4" /></Button>
              <Button v-if="r.status !== 'confirmed'" variant="ghost" size="icon" class="text-green-600" @click="handleConfirm(r.id)"><Check class="h-4 w-4" /></Button>
              <Button v-if="r.status !== 'confirmed'" variant="ghost" size="icon" class="text-red-500" @click="handleDelete(r.id)"><Trash2 class="h-4 w-4" /></Button>
            </td>
          </tr>
          <tr v-if="!filteredReceipts.length">
            <td colspan="7" class="px-4 py-8 text-center text-sm text-gray-400">Tidak ada data</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Teleport to="body">
      <div v-if="dialog.open.value" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="dialog.close()">
        <div class="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl mx-4 max-h-[90vh] overflow-y-auto">
          <h2 class="text-lg font-semibold mb-4">{{ dialog.editing.value ? 'Edit Receipt' : 'Tambah Receipt' }}</h2>
          <form @submit.prevent="handleSave" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-sm font-medium">Supplier</label>
                <select v-model="dialog.form.supplier_id" required
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="">Pilih Supplier</option>
                  <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
                </select>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium">Warehouse</label>
                <select v-model="dialog.form.warehouse_id" required
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="">Pilih Warehouse</option>
                  <option v-for="w in warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
                </select>
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Tgl. Terima</label>
              <Input v-model="dialog.form.receipt_date" type="date" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Notes</label>
              <Input v-model="dialog.form.notes" />
            </div>

            <template v-if="!dialog.editing.value">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-medium">Detail Items</label>
                  <Button type="button" variant="outline" size="sm" @click="addDetailRow">
                    <Plus class="h-3 w-3 mr-1" /> Tambah Item
                  </Button>
                </div>
                <div v-for="(row, idx) in detailRows" :key="idx" class="flex gap-2 items-start">
                  <select v-model="row.item_id" required
                    class="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="">Pilih Item</option>
                    <option v-for="item in items" :key="item.id" :value="item.id">{{ item.code }} - {{ item.name }}</option>
                  </select>
                  <Input v-model.number="row.quantity_received" type="number" min="0" placeholder="Qty" class="w-24" />
                  <Input v-model="row.notes" placeholder="Notes" class="flex-1" />
                  <Button type="button" variant="ghost" size="icon" class="text-red-500 mt-1 shrink-0" @click="removeDetailRow(idx)">
                    <X class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </template>

            <template v-else>
              <div v-if="detailRows.length" class="space-y-1">
                <label class="text-sm font-medium">Detail Items</label>
                <div class="rounded-lg border overflow-hidden">
                  <table class="w-full">
                    <thead>
                      <tr class="border-b bg-gray-50 text-left text-xs font-medium text-gray-500">
                        <th class="px-3 py-2">Item</th>
                        <th class="px-3 py-2 w-24 text-center">Quantity</th>
                        <th class="px-3 py-2">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, idx) in detailRows" :key="idx" class="border-b last:border-0">
                        <td class="px-3 py-2 text-sm">{{ getItem(row.item_id)?.name || row.item_id }}</td>
                        <td class="px-3 py-2 text-sm text-center">{{ row.quantity_received }}</td>
                        <td class="px-3 py-2 text-sm text-gray-500">{{ row.notes || '-' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </template>

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

    <Teleport to="body">
      <div v-if="viewData" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="viewData = null">
        <div class="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl mx-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold">Detail Receipt</h2>
            <Badge :variant="viewData.status === 'confirmed' ? 'success' : 'warning'">
              {{ viewData.status === 'confirmed' ? 'Confirmed' : 'Draft' }}
            </Badge>
          </div>
          <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div><span class="text-gray-500">No. Receipt:</span><br /><span class="font-medium">{{ viewData.receipt_number || '-' }}</span></div>
            <div><span class="text-gray-500">Supplier:</span><br /><span class="font-medium">{{ getSupplier(viewData.supplier_id)?.name || viewData.supplier_id }}</span></div>
            <div><span class="text-gray-500">Warehouse:</span><br /><span class="font-medium">{{ getWarehouse(viewData.warehouse_id)?.name || viewData.warehouse_id }}</span></div>
            <div><span class="text-gray-500">Tgl. Terima:</span><br /><span class="font-medium">{{ viewData.receipt_date ? new Date(viewData.receipt_date).toLocaleDateString('id-ID') : '-' }}</span></div>
            <div><span class="text-gray-500">Diterima Oleh:</span><br /><span class="font-medium">{{ viewData.received_by || '-' }}</span></div>
            <div><span class="text-gray-500">Notes:</span><br /><span class="font-medium">{{ viewData.notes || '-' }}</span></div>
          </div>
          <div v-if="viewData.details?.length" class="rounded-lg border overflow-hidden">
            <table class="w-full">
              <thead>
                <tr class="border-b bg-gray-50 text-left text-sm font-medium text-gray-500">
                  <th class="px-4 py-2">Item</th>
                  <th class="px-4 py-2">Quantity</th>
                  <th class="px-4 py-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(d, idx) in viewData.details" :key="idx" class="border-b last:border-0">
                  <td class="px-4 py-2 text-sm">{{ getItem(d.item_id)?.name || d.item_id }}</td>
                  <td class="px-4 py-2 text-sm">{{ d.quantity_received }}</td>
                  <td class="px-4 py-2 text-sm text-gray-500">{{ d.notes || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="text-sm text-gray-400 py-4 text-center">Tidak ada detail item</div>
          <div class="flex justify-end mt-4">
            <Button variant="outline" @click="viewData = null">Tutup</Button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
