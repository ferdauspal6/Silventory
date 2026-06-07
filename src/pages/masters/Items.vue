<script setup lang="ts">
import { onMounted, ref, computed, reactive } from 'vue'
import { apiService } from '@/lib/api'
import { useFormDialog } from '@/composables/useFormDialog'
import { Button, Input, Badge } from '@/components/ui'
import { Loader2, Plus, Pencil, Trash2, Search, ListPlus } from '@lucide/vue'

const items = ref<any[]>([])
const categories = ref<any[]>([])
const brands = ref<any[]>([])
const units = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')

const dialog = useFormDialog({
  id: '', code: '', name: '', category_id: '', brand_id: '', unit_id: '',
  description: '', min_stock: 0,
})

// Quick-add state
const quickAdd = reactive({
  category: { open: false, submitting: false, name: '', description: '' },
  brand: { open: false, submitting: false, name: '', description: '' },
  unit: { open: false, submitting: false, name: '', abbreviation: '' },
})

async function quickAddCategory() {
  quickAdd.category.submitting = true
  try {
    const res = await apiService.createCategory({ name: quickAdd.category.name, description: quickAdd.category.description })
    if (res.success) {
      const catRes = await apiService.getCategories()
      if (catRes.success) categories.value = catRes.data as any[]
      dialog.form.category_id = (res.data as any).id
      quickAdd.category.open = false
      quickAdd.category.name = ''
      quickAdd.category.description = ''
    }
  } finally {
    quickAdd.category.submitting = false
  }
}

async function quickAddBrand() {
  quickAdd.brand.submitting = true
  try {
    const res = await apiService.createBrand({ name: quickAdd.brand.name, description: quickAdd.brand.description })
    if (res.success) {
      const brRes = await apiService.getBrands()
      if (brRes.success) brands.value = brRes.data as any[]
      dialog.form.brand_id = (res.data as any).id
      quickAdd.brand.open = false
      quickAdd.brand.name = ''
      quickAdd.brand.description = ''
    }
  } finally {
    quickAdd.brand.submitting = false
  }
}

async function quickAddUnit() {
  quickAdd.unit.submitting = true
  try {
    const res = await apiService.createUnit({ name: quickAdd.unit.name, abbreviation: quickAdd.unit.abbreviation })
    if (res.success) {
      const unRes = await apiService.getUnits()
      if (unRes.success) units.value = unRes.data as any[]
      dialog.form.unit_id = (res.data as any).id
      quickAdd.unit.open = false
      quickAdd.unit.name = ''
      quickAdd.unit.abbreviation = ''
    }
  } finally {
    quickAdd.unit.submitting = false
  }
}

async function fetchData() {
  loading.value = true
  error.value = ''
  try {
    const [itemsRes, catsRes, brandsRes, unitsRes] = await Promise.all([
      apiService.getItems(),
      apiService.getCategories(),
      apiService.getBrands(),
      apiService.getUnits(),
    ])
    if (itemsRes.success) items.value = itemsRes.data as any[]
    if (catsRes.success) categories.value = catsRes.data as any[]
    if (brandsRes.success) brands.value = brandsRes.data as any[]
    if (unitsRes.success) units.value = unitsRes.data as any[]
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

function getCategoryName(id: string) {
  return categories.value.find(c => c.id === id)?.name || '-'
}

function getBrandName(id: string) {
  return brands.value.find(b => b.id === id)?.name || '-'
}

function getUnitName(id: string) {
  return units.value.find(u => u.id === id)?.abbreviation || '-'
}

async function handleSave() {
  dialog.submitting.value = true
  try {
    const payload = {
      code: dialog.form.code,
      name: dialog.form.name,
      category_id: dialog.form.category_id,
      brand_id: dialog.form.brand_id,
      unit_id: dialog.form.unit_id,
      description: dialog.form.description,
      min_stock: Number(dialog.form.min_stock),
    }
    if (dialog.editing.value) {
      await apiService.updateItem({ id: dialog.form.id, ...payload })
    } else {
      await apiService.createItem(payload)
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
  if (confirm('Hapus item ini?')) {
    await apiService.deleteItem(id)
    await fetchData()
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <div class="relative w-64">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input v-model="searchQuery" placeholder="Cari item..." class="pl-9" />
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
            <th class="px-4 py-3">Kategori</th>
            <th class="px-4 py-3">Brand</th>
            <th class="px-4 py-3">Satuan</th>
            <th class="px-4 py-3">Min Stock</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredItems" :key="item.id" class="border-b last:border-0 hover:bg-gray-50">
            <td class="px-4 py-3 text-sm font-mono">{{ item.code }}</td>
            <td class="px-4 py-3 text-sm font-medium">{{ item.name }}</td>
            <td class="px-4 py-3 text-sm text-gray-500">{{ getCategoryName(item.category_id) }}</td>
            <td class="px-4 py-3 text-sm text-gray-500">{{ getBrandName(item.brand_id) }}</td>
            <td class="px-4 py-3 text-sm text-gray-500">{{ getUnitName(item.unit_id) }}</td>
            <td class="px-4 py-3 text-sm">{{ item.min_stock }}</td>
            <td class="px-4 py-3">
              <Badge :variant="item.is_active ? 'default' : 'secondary'">{{ item.is_active ? 'Aktif' : 'Nonaktif' }}</Badge>
            </td>
            <td class="px-4 py-3 text-right">
              <Button variant="ghost" size="icon" @click="dialog.openEdit(item)"><Pencil class="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" class="text-red-500" @click="handleDelete(item.id)"><Trash2 class="h-4 w-4" /></Button>
            </td>
          </tr>
          <tr v-if="!filteredItems.length">
            <td colspan="8" class="px-4 py-8 text-center text-sm text-gray-400">Tidak ada data</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Teleport to="body">
      <div v-if="dialog.open.value" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="dialog.close()">
        <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl mx-4 max-h-[90vh] overflow-y-auto">
          <h2 class="text-lg font-semibold mb-4">{{ dialog.editing.value ? 'Edit Item' : 'Tambah Item' }}</h2>
          <form @submit.prevent="handleSave" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-sm font-medium">Kode Item</label>
                <Input v-model="dialog.form.code" required />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium">Nama Item</label>
                <Input v-model="dialog.form.name" required />
              </div>
            </div>
            <div class="grid grid-cols-3 gap-4">
              <div class="space-y-2">
                <label class="text-sm font-medium">Kategori</label>
                <div class="flex gap-1">
                  <select v-model="dialog.form.category_id" required
                    class="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="">Pilih Kategori</option>
                    <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                  </select>
                  <button type="button" @click="quickAdd.category.open = true"
                    class="h-10 w-10 shrink-0 rounded-md border border-input bg-background flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                    title="Tambah Kategori Baru">
                    <ListPlus class="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium">Brand</label>
                <div class="flex gap-1">
                  <select v-model="dialog.form.brand_id" required
                    class="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="">Pilih Brand</option>
                    <option v-for="b in brands" :key="b.id" :value="b.id">{{ b.name }}</option>
                  </select>
                  <button type="button" @click="quickAdd.brand.open = true"
                    class="h-10 w-10 shrink-0 rounded-md border border-input bg-background flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                    title="Tambah Brand Baru">
                    <ListPlus class="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium">Satuan</label>
                <div class="flex gap-1">
                  <select v-model="dialog.form.unit_id" required
                    class="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="">Pilih Satuan</option>
                    <option v-for="u in units" :key="u.id" :value="u.id">{{ u.abbreviation }} - {{ u.name }}</option>
                  </select>
                  <button type="button" @click="quickAdd.unit.open = true"
                    class="h-10 w-10 shrink-0 rounded-md border border-input bg-background flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                    title="Tambah Satuan Baru">
                    <ListPlus class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Deskripsi</label>
              <Input v-model="dialog.form.description" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Min. Stock Alert</label>
              <Input v-model.number="dialog.form.min_stock" type="number" min="0" />
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

    <!-- Quick-add Category -->
    <Teleport to="body">
      <div v-if="quickAdd.category.open" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" @click.self="quickAdd.category.open = false">
        <div class="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl mx-4">
          <h3 class="text-base font-semibold mb-3">Tambah Kategori Baru</h3>
          <form @submit.prevent="quickAddCategory" class="space-y-3">
            <div class="space-y-1">
              <label class="text-sm font-medium">Nama</label>
              <Input v-model="quickAdd.category.name" placeholder="Nama kategori" required />
            </div>
            <div class="space-y-1">
              <label class="text-sm font-medium">Deskripsi</label>
              <Input v-model="quickAdd.category.description" placeholder="Opsional" />
            </div>
            <div class="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" @click="quickAdd.category.open = false">Batal</Button>
              <Button type="submit" size="sm" :disabled="quickAdd.category.submitting">
                <Loader2 v-if="quickAdd.category.submitting" class="mr-1 h-3 w-3 animate-spin" /> Simpan
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Quick-add Brand -->
    <Teleport to="body">
      <div v-if="quickAdd.brand.open" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" @click.self="quickAdd.brand.open = false">
        <div class="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl mx-4">
          <h3 class="text-base font-semibold mb-3">Tambah Brand Baru</h3>
          <form @submit.prevent="quickAddBrand" class="space-y-3">
            <div class="space-y-1">
              <label class="text-sm font-medium">Nama</label>
              <Input v-model="quickAdd.brand.name" placeholder="Nama brand" required />
            </div>
            <div class="space-y-1">
              <label class="text-sm font-medium">Deskripsi</label>
              <Input v-model="quickAdd.brand.description" placeholder="Opsional" />
            </div>
            <div class="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" @click="quickAdd.brand.open = false">Batal</Button>
              <Button type="submit" size="sm" :disabled="quickAdd.brand.submitting">
                <Loader2 v-if="quickAdd.brand.submitting" class="mr-1 h-3 w-3 animate-spin" /> Simpan
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Quick-add Unit -->
    <Teleport to="body">
      <div v-if="quickAdd.unit.open" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" @click.self="quickAdd.unit.open = false">
        <div class="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl mx-4">
          <h3 class="text-base font-semibold mb-3">Tambah Satuan Baru</h3>
          <form @submit.prevent="quickAddUnit" class="space-y-3">
            <div class="space-y-1">
              <label class="text-sm font-medium">Nama</label>
              <Input v-model="quickAdd.unit.name" placeholder="pcs, kg, liter, box" required />
            </div>
            <div class="space-y-1">
              <label class="text-sm font-medium">Singkatan</label>
              <Input v-model="quickAdd.unit.abbreviation" placeholder="pcs, kg, L" required />
            </div>
            <div class="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" @click="quickAdd.unit.open = false">Batal</Button>
              <Button type="submit" size="sm" :disabled="quickAdd.unit.submitting">
                <Loader2 v-if="quickAdd.unit.submitting" class="mr-1 h-3 w-3 animate-spin" /> Simpan
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
