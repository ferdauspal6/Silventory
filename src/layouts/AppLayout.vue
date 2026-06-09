<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  LayoutDashboard,
  Package,
  Tag,
  Building2,
  Box,
  Truck,
  Warehouse,
  ArrowLeftRight,
  ClipboardCheck,
  Gauge,
  Users,
  History,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  List,
  ShoppingCart,
} from '@lucide/vue'
import { Button } from '@/components/ui'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const mobileMenuOpen = ref(false)
const expandedMenus = ref<Record<string, boolean>>({
  masters: true,
  stock: false,
  transactions: false,
})

interface NavItem {
  label?: string
  icon?: any
  route?: string
  key?: string
  children?: { label: string; route: string }[]
  type?: 'separator' | 'item'
}

const navItems = computed<NavItem[]>(() => {
  const items: NavItem[] = [
    { label: 'Dashboard', icon: Gauge, route: '/dashboard' },
    { label: 'Kasir / POS', icon: ShoppingCart, route: '/pos' },
    { type: 'separator' } as NavItem,
    {
      label: 'Master Data',
      icon: Box,
      key: 'masters',
      children: [
        { label: 'Kategori', route: '/masters/categories' },
        { label: 'Brand', route: '/masters/brands' },
        { label: 'Satuan', route: '/masters/units' },
        { label: 'Item Barang', route: '/masters/items' },
        { label: 'Supplier', route: '/masters/suppliers' },
        { label: 'Gudang/Proyek', route: '/masters/warehouses' },
      ],
    },
    {
      label: 'Stock',
      icon: Warehouse,
      key: 'stock',
      children: [
        { label: 'Stock Aktual', route: '/stock' },
        { label: 'Stock Rendah', route: '/stock/low' },
      ],
    },
    {
      label: 'Transaksi',
      icon: Truck,
      key: 'transactions',
      children: [
        { label: 'Request Item', route: '/transactions/requests' },
        { label: 'Penerimaan', route: '/transactions/receipts' },
        { label: 'Transfer Stock', route: '/transactions/transfers' },
        { label: 'Stock Opname', route: '/transactions/opnames' },
        { label: 'Stock Usage', route: '/transactions/usages' },
      ],
    },
    { label: 'Activity Log', icon: History, route: '/activity' },
  ]
  if (auth.isManager) {
    items.push({ label: 'User Management', icon: Users, route: '/users' })
  }
  return items
})

const bottomNavItems = [
  { label: 'Dashboard', icon: Gauge, route: '/dashboard' },
  { label: 'Stock', icon: Warehouse, route: '/stock' },
  { label: 'Transaksi', icon: Truck, route: '/transactions/requests' },
  { label: 'Master', icon: Box, route: '/masters/items' },
  { label: 'Activity', icon: History, route: '/activity' },
]

function isActive(path: string) {
  return route.path === path
}

function isParentActive(children: { route: string }[]) {
  return children.some(c => route.path.startsWith(c.route))
}

function navigateTo(path: string) {
  router.push(path)
  mobileMenuOpen.value = false
}

function toggleMenu(key: string) {
  expandedMenus.value[key] = !expandedMenus.value[key]
}

function handleLogout() {
  auth.logout()
  router.push('/login')
}

const pageTitle = computed(() => {
  const meta = route.meta?.title as string
  return meta || ''
})

const currentTime = ref(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }))
setInterval(() => {
  currentTime.value = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}, 60000)
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <!-- Mobile Header -->
    <header class="lg:hidden flex items-center justify-between bg-[#1e3a5f] text-white px-4 h-14 shrink-0">
      <button @click="mobileMenuOpen = !mobileMenuOpen" class="p-1">
        <Menu v-if="!mobileMenuOpen" class="h-6 w-6" />
        <X v-else class="h-6 w-6" />
      </button>
      <div class="flex items-center gap-2">
        <Package class="h-5 w-5" />
        <span class="font-semibold text-sm">Silventory</span>
      </div>
      <div class="w-8" />
    </header>

    <!-- Mobile Sidebar Overlay -->
    <div
      v-if="mobileMenuOpen"
      class="lg:hidden fixed inset-0 z-40 bg-black/50"
      @click="mobileMenuOpen = false"
    />

    <!-- Mobile Sidebar -->
    <aside
      class="lg:hidden fixed top-14 left-0 z-50 h-[calc(100vh-3.5rem)] w-72 bg-white border-r shadow-xl transition-transform duration-300 overflow-y-auto"
      :class="mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="p-4 border-b">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white font-bold text-sm">
            {{ auth.getInitials(auth.userName) }}
          </div>
          <div>
            <div class="font-medium text-sm">{{ auth.userName }}</div>
            <div class="text-xs text-gray-400 capitalize">{{ auth.userRole }}</div>
          </div>
        </div>
      </div>
      <nav class="p-3 space-y-1">
        <template v-for="item in navItems" :key="item.label || item.type">
          <hr v-if="item.type === 'separator'" class="my-2 border-gray-200" />
          <div v-else-if="item.children">
            <button
              @click="toggleMenu(item.key!)"
              class="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              :class="isParentActive(item.children) ? 'bg-[#1e3a5f] text-white' : 'text-gray-700 hover:bg-gray-100'"
            >
              <span class="flex items-center gap-3">
                <component :is="item.icon" class="h-4 w-4" />
                {{ item.label }}
              </span>
              <ChevronDown class="h-4 w-4 transition-transform" :class="expandedMenus[item.key!] ? 'rotate-0' : '-rotate-90'" />
            </button>
            <div v-if="expandedMenus[item.key!]" class="ml-7 mt-1 space-y-1">
              <button
                v-for="child in item.children"
                :key="child.route"
                @click="navigateTo(child.route)"
                class="block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                :class="isActive(child.route) ? 'bg-slate-100 text-[#1e3a5f] font-medium' : 'text-gray-600 hover:bg-gray-50'"
              >
                {{ child.label }}
              </button>
            </div>
          </div>
          <button
            v-else
            @click="navigateTo(item.route!)"
            class="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
            :class="isActive(item.route!) ? 'bg-[#1e3a5f] text-white' : 'text-gray-700 hover:bg-gray-100'"
          >
            <component :is="item.icon" class="h-4 w-4" />
            {{ item.label }}
          </button>
        </template>
        <hr class="my-3" />
        <button
          @click="handleLogout"
          class="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut class="h-4 w-4" />
          Keluar
        </button>
      </nav>
    </aside>

    <!-- Desktop Sidebar -->
    <aside class="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-[#1e3a5f] text-white">
      <div class="flex items-center gap-3 px-6 h-16 border-b border-white/10 shrink-0">
        <Package class="h-6 w-6 text-amber-400" />
        <div>
          <div class="font-semibold text-sm">Silventory</div>
          <div class="text-xs text-white/60">Inventory ERP</div>
        </div>
      </div>
      <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <template v-for="item in navItems" :key="item.label || item.type">
          <hr v-if="item.type === 'separator'" class="my-2 border-white/10" />
          <div v-else-if="item.children">
            <button
              @click="toggleMenu(item.key!)"
              class="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              :class="isParentActive(item.children) ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'"
            >
              <span class="flex items-center gap-3">
                <component :is="item.icon" class="h-4 w-4" />
                {{ item.label }}
              </span>
              <ChevronDown class="h-4 w-4 transition-transform" :class="expandedMenus[item.key!] ? '' : '-rotate-90'" />
            </button>
            <div v-if="expandedMenus[item.key!]" class="ml-7 mt-1 space-y-1">
              <button
                v-for="child in item.children"
                :key="child.route"
                @click="navigateTo(child.route)"
                class="block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                :class="isActive(child.route) ? 'bg-white/15 text-white font-medium' : 'text-white/60 hover:bg-white/10 hover:text-white'"
              >
                {{ child.label }}
              </button>
            </div>
          </div>
          <button
            v-else
            @click="navigateTo(item.route!)"
            class="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
            :class="isActive(item.route!) ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'"
          >
            <component :is="item.icon" class="h-4 w-4" />
            {{ item.label }}
          </button>
        </template>
      </nav>
      <div class="border-t border-white/10 px-4 py-3">
        <div class="flex items-center gap-3">
          <div class="h-9 w-9 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-xs">
            {{ auth.getInitials(auth.userName) }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium truncate">{{ auth.userName }}</div>
            <div class="text-xs text-white/60 capitalize">{{ auth.userRole }}</div>
          </div>
          <button @click="handleLogout" class="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors" title="Keluar">
            <LogOut class="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="lg:pl-64 flex flex-col flex-1">
      <!-- Desktop Header -->
      <header class="hidden lg:flex items-center justify-between h-16 px-6 bg-white border-b shrink-0">
        <h1 class="text-lg font-semibold text-gray-800">{{ pageTitle }}</h1>
        <div class="flex items-center gap-4 text-sm text-gray-500">
          <span>{{ currentTime }}</span>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6">
        <router-view />
      </main>
    </div>

    <!-- Mobile Bottom Nav -->
    <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t flex items-center justify-around h-16 safe-area-bottom">
      <button
        v-for="item in bottomNavItems"
        :key="item.label"
        @click="navigateTo(item.route)"
        class="flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-0 transition-colors"
        :class="isActive(item.route) ? 'text-[#1e3a5f]' : 'text-gray-400'"
      >
        <component :is="item.icon" class="h-5 w-5" />
        <span class="text-[10px] font-medium">{{ item.label }}</span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}
</style>
