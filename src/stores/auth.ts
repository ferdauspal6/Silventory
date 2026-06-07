import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/lib/api'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const isManager = computed(() => user.value?.role === 'manager')
  const isAdmin = computed(() => user.value?.role === 'admin')
  const userName = computed(() => user.value?.name || '')
  const userRole = computed(() => user.value?.role || '')

  function getInitials(name: string) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  }

  async function login(email: string, password: string) {
    loading.value = true
    try {
      const res = await apiService.login(email, password)
      if (res.success) {
        user.value = res.data as unknown as User
        return true
      }
      return false
    } catch (err) {
      throw err
    } finally {
      loading.value = false
    }
  }

  function logout() {
    user.value = null
  }

  return { user, loading, isAuthenticated, isManager, isAdmin, userName, userRole, getInitials, login, logout }
})
