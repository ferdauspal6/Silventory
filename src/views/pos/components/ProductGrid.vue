<script setup lang="ts">
import { ref, computed } from 'vue'
import { Input } from '@/components/ui'
import { Search, Package } from '@lucide/vue'

const props = defineProps<{
  items: any[]
  categories: any[]
  selectedCategoryId: string
}>()

const emit = defineEmits<{
  addItem: [item: any]
  selectCategory: [id: string]
}>()

const searchQuery = ref('')

const filteredItems = computed(() => {
  let result = props.items
  if (props.selectedCategoryId) {
    result = result.filter(i => i.category_id === props.selectedCategoryId)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(i =>
      i.name?.toLowerCase().includes(q) || i.code?.toLowerCase().includes(q)
    )
  }
  return result
})

function handleAdd(item: any) {
  if (Number(item.stock_available || 0) <= 0) return
  emit('addItem', item)
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Search -->
    <div class="p-3 sm:p-4">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          v-model="searchQuery"
          placeholder="Cari nama atau kode item..."
          class="pl-9 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 h-11 text-sm"
        />
      </div>
    </div>

    <!-- Category tabs -->
    <div class="px-3 sm:px-4 pb-2 overflow-x-auto">
      <div class="flex gap-2">
        <button
          @click="emit('selectCategory', '')"
          class="shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap"
          :class="!selectedCategoryId ? 'bg-[#0ea5e9] text-white shadow-lg shadow-[#0ea5e9]/20' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'"
        >
          Semua
        </button>
        <button
          v-for="cat in categories"
          :key="cat.id"
          @click="emit('selectCategory', cat.id)"
          class="shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap"
          :class="selectedCategoryId === cat.id ? 'bg-[#0ea5e9] text-white shadow-lg shadow-[#0ea5e9]/20' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'"
        >
          {{ cat.name }}
        </button>
      </div>
    </div>

    <!-- Grid -->
    <div class="flex-1 overflow-y-auto px-3 sm:px-4 pb-4">
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <button
          v-for="item in filteredItems"
          :key="item.id"
          @click="handleAdd(item)"
          class="relative rounded-xl border transition-all duration-150 p-3 text-left flex flex-col"
          :class="
            Number(item.stock_available || 0) <= 0
              ? 'border-gray-700/50 bg-gray-800/30 opacity-50 cursor-not-allowed'
              : 'border-gray-700 bg-gray-800 hover:border-[#0ea5e9]/50 hover:bg-gray-800/80 hover:shadow-lg hover:shadow-[#0ea5e9]/5 cursor-pointer active:scale-[0.98]'
          "
        >
          <div class="h-12 w-12 rounded-lg bg-gradient-to-br from-[#0ea5e9]/20 to-[#0ea5e9]/5 flex items-center justify-center mb-2">
            <Package class="h-6 w-6 text-[#0ea5e9]" />
          </div>
          <div class="text-sm font-medium text-white truncate">{{ item.name }}</div>
          <div class="text-xs text-gray-500 font-mono mt-0.5">{{ item.code }}</div>
          <div class="text-sm font-bold text-[#0ea5e9] mt-1">
            {{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(item.price || 0)) }}
          </div>
          <div
            class="mt-1.5 text-xs font-medium"
            :class="
              Number(item.stock_available || 0) <= 0
                ? 'text-red-400'
                : Number(item.stock_available || 0) <= 5
                  ? 'text-yellow-400'
                  : 'text-green-400'
            "
          >
            Stok: {{ item.stock_available || 0 }}
          </div>
        </button>
      </div>

      <div v-if="!filteredItems.length" class="flex flex-col items-center justify-center py-16 text-gray-500">
        <Package class="h-12 w-12 mb-3 opacity-30" />
        <p class="text-sm">Item tidak ditemukan</p>
      </div>
    </div>
  </div>
</template>
