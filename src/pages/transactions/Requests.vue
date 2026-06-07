<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { apiService } from '@/lib/api'
import { useFormDialog } from '@/composables/useFormDialog'
import { useAuthStore } from '@/stores/auth'
import { Button, Input, Badge } from '@/components/ui'
import { Loader2, Plus, Pencil, Trash2, Search, Eye, Send, Check, XCircle, X } from '@lucide/vue'

const auth = useAuthStore()
const requests = ref<any[]>([])
const items = ref<any[]>([])
const users = ref<any[]>([])
const warehouses = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')

const dialog = useFormDialog({
  id: '', warehouse_id: '', notes: '',
})

const detailRows = ref<any[]>([])

const detailDialogOpen = ref(false)
const selectedRequest = ref<any>(null)

const confirmDialog = ref({ open: false, id: '', action: '' })
const rejectReason = ref('')

function resetDetailRows() {
  detailRows.value = [{ item_id: '', quantity_requested: 1, notes: '' }]
}

function addDetailRow() {
  detailRows.value.push({ item_id: '', quantity_requested: 1, notes: '' })
}

function removeDetailRow(index: number) {
  detailRows.value.splice(index, 1)
}

async function fetchData() {
  loading.value = true
  error.value = ''
  try {
    const [reqRes, itemsRes, usersRes, whRes] = await Promise.all([
      apiService.getRequests(),
      apiService.getItems(),
      apiService.getUsers(),
      apiService.getWarehouses(),
    ])
    if (reqRes.success) requests.value = reqRes.data as any[]
    if (itemsRes.success) items.value = itemsRes.data as any[]
    if (usersRes.success) users.value = usersRes.data as any[]
    if (whRes.success) warehouses.value = whRes.data as any[]
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchData())

function getUser(id: string) { return users.value.find(u => u.id === id) }
function getWarehouse(id: string) { return warehouses.value.find(w => w.id === id) }
function getItem(id: string) { return items.value.find(i => i.id === id) }

const filteredRequests = computed(() => {
  if (!searchQuery.value) return requests.value
  const q = searchQuery.value.toLowerCase()
  return requests.value.filter((r: any) =>
    r.request_number?.toLowerCase().includes(q) ||
    getWarehouse(r.warehouse_id)?.name?.toLowerCase().includes(q) ||
    getUser(r.requested_by)?.name?.toLowerCase().includes(q)
  )
})

function statusLabel(status: string) {
  const map: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    approved: 'Approved',
    rejected: 'Rejected',
  }
  return map[status] || status
}

function statusClass(status: string) {
  const map: Record<string, string> = {
    draft: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    submitted: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
    approved: 'bg-green-100 text-green-700 hover:bg-green-200',
    rejected: 'bg-red-100 text-red-700 hover:bg-red-200',
  }
  return map[status] || ''
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

function openCreate() {
  dialog.openCreate()
  resetDetailRows()
}

function openEdit(req: any) {
  dialog.openEdit({ id: req.id, warehouse_id: req.warehouse_id, notes: req.notes || '' })
  detailRows.value = (req.details || []).map((d: any) => ({
    item_id: d.item_id,
    quantity_requested: d.quantity_requested,
    notes: d.notes || '',
  }))
  if (!detailRows.value.length) resetDetailRows()
}

async function openDetail(req: any) {
  try {
    const res = await apiService.getRequestById(req.id)
    if (res.success) {
      selectedRequest.value = res.data as any
    } else {
      selectedRequest.value = req
    }
  } catch {
    selectedRequest.value = req
  }
  detailDialogOpen.value = true
}

async function handleSave() {
  dialog.submitting.value = true
  try {
    const payload = {
      warehouse_id: dialog.form.warehouse_id,
      notes: dialog.form.notes,
      details: detailRows.value.map((d: any) => ({
        item_id: d.item_id,
        quantity_requested: Number(d.quantity_requested),
        notes: d.notes,
      })),
    }
    if (dialog.editing.value) {
      await apiService.updateRequest({ id: dialog.form.id, ...payload })
    } else {
      await apiService.createRequest({ ...payload, requested_by: auth.user?.id })
    }
    dialog.close()
    await fetchData()
  } catch (err: any) {
    error.value = err.message
  } finally {
    dialog.submitting.value = false
  }
}

async function handleSubmit(id: string) {
  if (!confirm('Submit request ini?')) return
  try {
    await apiService.submitRequest(id, auth.user?.id)
    await fetchData()
  } catch (err: any) {
    error.value = err.message
  }
}

async function handleDelete(id: string) {
  if (!confirm('Hapus request ini?')) return
  try {
    await apiService.deleteRequest(id)
    await fetchData()
  } catch (err: any) {
    error.value = err.message
  }
}

function openConfirm(id: string, action: string) {
  confirmDialog.value = { open: true, id, action }
  rejectReason.value = ''
}

async function handleConfirm() {
  try {
    if (confirmDialog.value.action === 'approve') {
      await apiService.approveRequest(confirmDialog.value.id, auth.user?.id || '')
    } else {
      await apiService.rejectRequest(confirmDialog.value.id, auth.user?.id || '', rejectReason.value)
    }
    confirmDialog.value = { open: false, id: '', action: '' }
    rejectReason.value = ''
    await fetchData()
  } catch (err: any) {
    error.value = err.message
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <div class="relative w-64">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input v-model="searchQuery" placeholder="Cari request..." class="pl-9" />
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
            <th class="px-4 py-3">No. Request</th>
            <th class="px-4 py-3">Warehouse</th>
            <th class="px-4 py-3">Requested By</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3">Tanggal</th>
            <th class="px-4 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="req in filteredRequests" :key="req.id" class="border-b last:border-0 hover:bg-gray-50">
            <td class="px-4 py-3 text-sm font-mono">{{ req.request_number }}</td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ getWarehouse(req.warehouse_id)?.name || req.warehouse_id }}</td>
            <td class="px-4 py-3 text-sm text-gray-500">{{ getUser(req.requested_by)?.name || req.requested_by }}</td>
            <td class="px-4 py-3">
              <Badge :class="statusClass(req.status)">{{ statusLabel(req.status) }}</Badge>
            </td>
            <td class="px-4 py-3 text-sm text-gray-500">{{ formatDate(req.created_at) }}</td>
            <td class="px-4 py-3 text-right">
              <div class="inline-flex items-center gap-1">
                <Button variant="ghost" size="icon" @click="openDetail(req)" title="Lihat Detail">
                  <Eye class="h-4 w-4" />
                </Button>
                <Button v-if="req.status === 'draft'" variant="ghost" size="icon" @click="openEdit(req)" title="Edit">
                  <Pencil class="h-4 w-4" />
                </Button>
                <Button v-if="req.status === 'draft'" variant="ghost" size="icon" class="text-amber-500" @click="handleSubmit(req.id)" title="Submit">
                  <Send class="h-4 w-4" />
                </Button>
                <Button v-if="req.status === 'draft'" variant="ghost" size="icon" class="text-red-500" @click="handleDelete(req.id)" title="Hapus">
                  <Trash2 class="h-4 w-4" />
                </Button>
                <template v-if="auth.isManager && req.status === 'submitted'">
                  <Button variant="ghost" size="icon" class="text-green-500" @click="openConfirm(req.id, 'approve')" title="Approve">
                    <Check class="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" class="text-red-500" @click="openConfirm(req.id, 'reject')" title="Reject">
                    <XCircle class="h-4 w-4" />
                  </Button>
                </template>
              </div>
            </td>
          </tr>
          <tr v-if="!filteredRequests.length">
            <td colspan="6" class="px-4 py-8 text-center text-sm text-gray-400">Tidak ada data request</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Teleport to="body">
      <div v-if="dialog.open.value" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="dialog.close()">
        <div class="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl mx-4 max-h-[90vh] overflow-y-auto">
          <h2 class="text-lg font-semibold mb-4">{{ dialog.editing.value ? 'Edit Request' : 'Tambah Request' }}</h2>
          <form @submit.prevent="handleSave" class="space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">Warehouse</label>
              <select v-model="dialog.form.warehouse_id" required
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="">Pilih Warehouse</option>
                <option v-for="wh in warehouses" :key="wh.id" :value="wh.id">{{ wh.name }}</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Catatan</label>
              <Input v-model="dialog.form.notes" placeholder="Catatan request (opsional)" />
            </div>

            <div class="border rounded-lg p-4 space-y-3">
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium">Detail Items</label>
                <Button type="button" variant="outline" size="sm" @click="addDetailRow">
                  <Plus class="h-3 w-3 mr-1" /> Tambah Item
                </Button>
              </div>
              <div v-for="(row, index) in detailRows" :key="index" class="flex items-start gap-2 p-2 border rounded-md">
                <div class="flex-1 space-y-1">
                  <label class="text-xs text-gray-500">Item</label>
                  <select v-model="row.item_id" required
                    class="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <option value="">Pilih Item</option>
                    <option v-for="it in items" :key="it.id" :value="it.id">{{ it.code }} - {{ it.name }}</option>
                  </select>
                </div>
                <div class="w-24 space-y-1">
                  <label class="text-xs text-gray-500">Qty</label>
                  <Input v-model.number="row.quantity_requested" type="number" min="1" required class="h-9" />
                </div>
                <div class="flex-1 space-y-1">
                  <label class="text-xs text-gray-500">Catatan</label>
                  <Input v-model="row.notes" placeholder="Catatan item" class="h-9" />
                </div>
                <Button type="button" variant="ghost" size="icon" class="mt-5 text-red-500 shrink-0" @click="removeDetailRow(index)" :disabled="detailRows.length <= 1">
                  <X class="h-4 w-4" />
                </Button>
              </div>
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

    <Teleport to="body">
      <div v-if="detailDialogOpen && selectedRequest" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="detailDialogOpen = false">
        <div class="w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl mx-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold">Detail Request</h2>
            <Button variant="ghost" size="icon" @click="detailDialogOpen = false"><X class="h-4 w-4" /></Button>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p class="text-xs text-gray-500">No. Request</p>
              <p class="text-sm font-medium">{{ selectedRequest.request_number }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Status</p>
              <Badge :class="statusClass(selectedRequest.status)" class="mt-1">{{ statusLabel(selectedRequest.status) }}</Badge>
            </div>
            <div>
              <p class="text-xs text-gray-500">Warehouse</p>
              <p class="text-sm">{{ getWarehouse(selectedRequest.warehouse_id)?.name || selectedRequest.warehouse_id }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Requested By</p>
              <p class="text-sm">{{ getUser(selectedRequest.requested_by)?.name || selectedRequest.requested_by }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Tanggal Dibuat</p>
              <p class="text-sm">{{ formatDate(selectedRequest.created_at) }}</p>
            </div>
            <div v-if="selectedRequest.approved_by">
              <p class="text-xs text-gray-500">Approved By</p>
              <p class="text-sm">{{ getUser(selectedRequest.approved_by)?.name || selectedRequest.approved_by }}</p>
            </div>
            <div v-if="selectedRequest.submitted_at">
              <p class="text-xs text-gray-500">Submitted At</p>
              <p class="text-sm">{{ formatDate(selectedRequest.submitted_at) }}</p>
            </div>
            <div v-if="selectedRequest.approved_at">
              <p class="text-xs text-gray-500">Approved At</p>
              <p class="text-sm">{{ formatDate(selectedRequest.approved_at) }}</p>
            </div>
            <div v-if="selectedRequest.rejection_reason" class="col-span-2">
              <p class="text-xs text-gray-500">Alasan Rejection</p>
              <p class="text-sm text-red-600">{{ selectedRequest.rejection_reason }}</p>
            </div>
            <div v-if="selectedRequest.notes" class="col-span-2">
              <p class="text-xs text-gray-500">Catatan</p>
              <p class="text-sm text-gray-600">{{ selectedRequest.notes }}</p>
            </div>
          </div>

          <h3 class="text-sm font-semibold mb-2">Detail Items</h3>
          <div class="rounded-lg border overflow-hidden">
            <table class="w-full">
              <thead>
                <tr class="border-b bg-gray-50 text-left text-xs font-medium text-gray-500">
                  <th class="px-3 py-2">Item</th>
                  <th class="px-3 py-2">Kode</th>
                  <th class="px-3 py-2 text-right">Quantity</th>
                  <th class="px-3 py-2">Catatan</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="d in (selectedRequest.details || [])" :key="d.id || d.item_id" class="border-b last:border-0">
                  <td class="px-3 py-2 text-sm">{{ getItem(d.item_id)?.name || d.item_id }}</td>
                  <td class="px-3 py-2 text-sm font-mono text-gray-500">{{ getItem(d.item_id)?.code || '-' }}</td>
                  <td class="px-3 py-2 text-sm text-right font-medium">{{ d.quantity_requested }}</td>
                  <td class="px-3 py-2 text-sm text-gray-500">{{ d.notes || '-' }}</td>
                </tr>
                <tr v-if="!(selectedRequest.details || []).length">
                  <td colspan="4" class="px-3 py-4 text-center text-sm text-gray-400">Tidak ada detail items</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="confirmDialog.open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="confirmDialog = { open: false, id: '', action: '' }">
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl mx-4">
          <h2 class="text-lg font-semibold mb-2">{{ confirmDialog.action === 'approve' ? 'Approve Request' : 'Reject Request' }}</h2>
          <p class="text-sm text-gray-500 mb-4">
            {{ confirmDialog.action === 'approve' ? 'Setujui request ini?' : 'Tolak request ini dengan memberikan alasan.' }}
          </p>
          <div v-if="confirmDialog.action === 'reject'" class="space-y-2 mb-4">
            <label class="text-sm font-medium">Alasan Penolakan</label>
            <Input v-model="rejectReason" placeholder="Alasan penolakan..." />
          </div>
          <div class="flex justify-end gap-3">
            <Button type="button" variant="outline" @click="confirmDialog = { open: false, id: '', action: '' }">Batal</Button>
            <Button :class="confirmDialog.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'" @click="handleConfirm">
              {{ confirmDialog.action === 'approve' ? 'Approve' : 'Reject' }}
            </Button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
