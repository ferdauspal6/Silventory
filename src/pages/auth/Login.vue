<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui'
import { Loader2, Package } from '@lucide/vue'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

async function handleLogin() {
  if (!email.value || !password.value) {
    error.value = 'Email dan password harus diisi'
    return
  }
  submitting.value = true
  error.value = ''
  try {
    await auth.login(email.value, password.value)
    router.push('/')
  } catch (err: any) {
    error.value = err.message || 'Login gagal. Periksa email dan password.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 p-4">
    <Card class="w-full max-w-md">
      <CardHeader class="text-center">
        <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#1e3a5f]">
          <Package class="h-7 w-7 text-white" />
        </div>
        <CardTitle class="text-2xl">Silventory</CardTitle>
        <CardDescription>Inventory ERP System</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Email</label>
            <Input
              v-model="email"
              type="email"
              placeholder="manager@demo.com"
              required
            />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Password</label>
            <Input
              v-model="password"
              type="password"
              placeholder="******"
              required
            />
          </div>
          <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
          <Button type="submit" class="w-full" :disabled="submitting">
            <Loader2 v-if="submitting" class="mr-2 h-4 w-4 animate-spin" />
            Masuk
          </Button>
        </form>
        <div class="mt-6 rounded-lg bg-slate-100 p-3 text-xs text-gray-500">
          <p class="font-medium mb-1">Akun Demo:</p>
          <p>Manager: manager@demo.com / manager123</p>
          <p>Admin: admin@demo.com / admin123</p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
