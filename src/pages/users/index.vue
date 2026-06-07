<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { apiService } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import { Button, Input, Badge } from '@/components/ui'
import { Loader2, Plus, Pencil, UserX, Search } from '@lucide/vue'

const auth = useAuthStore()
const users = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const formOpen = ref(false)
const editing = ref(false)
const form = ref({ id: '', name: '', email: '', password: '', role: 'admin' })
const submitting = ref(false)

async function fetchData() {
  loading.value = true
  try {
    const res = await apiService.getUsers()
    if (res.success) users.value = (res.data as any[]).filter((u: any) => u.id !== auth.user?.id)
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchData())

function openCreate() {
  editing.value = false
  form.value = { id: '', name: '', email: '', password: '', role: 'admin' }
  formOpen.value = true
}

function openEdit(u: any) {
  editing.value = true
  form.value = { id: u.id, name: u.name, email: u.email, password: '', role: u.role }
  formOpen.value = true
}

async function handleSave() {
  submitting.value = true
  try {
    if (editing.value) {
      await apiService.updateUser({ id: form.value.id, name: form.value.name, email: form.value.email, role: form.value.role })
    } else {
      await apiService.createUser({ name: form.value.name, email: form.value.email, password: form.value.password, role: form.value.role })
    }
    formOpen.value = false
    await fetchData()
  } catch (err: any) {
    error.value = err.message
  } finally {
    submitting.value = false
  }
}

async function handleDeactivate(id: string) {
  if (confirm('Nonaktifkan user ini?')) {
    await apiService.deactivateUser(id)
    await fetchData()
  }
}
</script>

<template>
  <div>
    <div v-if="!auth.isManager" class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 mb-4">
      Hanya Manager yang dapat mengelola user.
    </div>

    <div class="flex items-center justify-between mb-4">
      <div class="relative w-64">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input v-model="searchQuery" placeholder="Cari user..." class="pl-9" />
      </div>
      <Button @click="openCreate()" :disabled="!auth.isManager">
        <Plus class="h-4 w-4 mr-1" /> Tambah User
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
            <th class="px-4 py-3">Email</th>
            <th class="px-4 py-3">Role</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id" class="border-b last:border-0 hover:bg-gray-50">
            <td class="px-4 py-3 text-sm font-medium">{{ u.name }}</td>
            <td class="px-4 py-3 text-sm text-gray-500">{{ u.email }}</td>
            <td class="px-4 py-3">
              <Badge :variant="u.role === 'manager' ? 'default' : 'secondary'" class="capitalize">{{ u.role }}</Badge>
            </td>
            <td class="px-4 py-3">
              <Badge :variant="u.is_active ? 'default' : 'destructive'">{{ u.is_active ? 'Aktif' : 'Nonaktif' }}</Badge>
            </td>
            <td class="px-4 py-3 text-right">
              <Button variant="ghost" size="icon" @click="openEdit(u)" :disabled="!auth.isManager"><Pencil class="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" class="text-red-500" @click="handleDeactivate(u.id)" :disabled="!auth.isManager">
                <UserX class="h-4 w-4" />
              </Button>
            </td>
          </tr>
          <tr v-if="!users.length">
            <td colspan="5" class="px-4 py-8 text-center text-sm text-gray-400">Tidak ada user lain</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Teleport to="body">
      <div v-if="formOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="formOpen = false">
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl mx-4">
          <h2 class="text-lg font-semibold mb-4">{{ editing ? 'Edit User' : 'Tambah User' }}</h2>
          <form @submit.prevent="handleSave" class="space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">Nama</label>
              <Input v-model="form.name" required />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Email</label>
              <Input v-model="form.email" type="email" required />
            </div>
            <div v-if="!editing" class="space-y-2">
              <label class="text-sm font-medium">Password</label>
              <Input v-model="form.password" type="password" required />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Role</label>
              <select v-model="form.role" required
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
              </select>
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" @click="formOpen = false">Batal</Button>
              <Button type="submit" :disabled="submitting">
                <Loader2 v-if="submitting" class="mr-2 h-4 w-4 animate-spin" /> Simpan
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
