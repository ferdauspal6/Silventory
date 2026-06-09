<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button, Input } from '@/components/ui'
import { Percent, Banknote, X } from '@lucide/vue'

const props = defineProps<{
  open: boolean
  currentType: 'percent' | 'fixed' | ''
  currentValue: number
  lineTotal?: number
}>()

const emit = defineEmits<{
  close: []
  apply: [type: 'percent' | 'fixed' | '', value: number]
  remove: []
}>()

const discType = ref<'percent' | 'fixed'>('percent')
const discValue = ref(0)

const previewAmount = computed(() => {
  const total = props.lineTotal || 0
  if (discType.value === 'percent') return total * (discValue.value / 100)
  return discValue.value
})

function handleApply() {
  emit('apply', discType.value, discValue.value)
  emit('close')
}

function handleRemove() {
  emit('remove')
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60" @click.self="emit('close')">
      <div class="w-full max-w-sm rounded-xl bg-[#1a1f2e] border border-gray-700 p-6 shadow-2xl mx-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-white">Diskon</h3>
          <button @click="emit('close')" class="p-1 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
            <X class="h-5 w-5" />
          </button>
        </div>

        <div class="flex rounded-lg bg-gray-800 p-1 mb-4">
          <button
            @click="discType = 'percent'"
            class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all"
            :class="discType === 'percent' ? 'bg-[#0ea5e9] text-white shadow-lg' : 'text-gray-400 hover:text-white'"
          >
            <Percent class="h-4 w-4" /> Persen (%)
          </button>
          <button
            @click="discType = 'fixed'"
            class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all"
            :class="discType === 'fixed' ? 'bg-[#0ea5e9] text-white shadow-lg' : 'text-gray-400 hover:text-white'"
          >
            <Banknote class="h-4 w-4" /> Nominal (Rp)
          </button>
        </div>

        <div class="mb-4">
          <label class="text-sm text-gray-400 mb-1.5 block">
            {{ discType === 'percent' ? 'Persentase' : 'Nominal' }}
          </label>
          <div class="relative">
            <span v-if="discType === 'fixed'" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
            <Input
              v-model.number="discValue"
              type="number"
              min="0"
              :placeholder="discType === 'percent' ? 'Contoh: 10' : 'Contoh: 5000'"
              class="bg-gray-800 border-gray-600 text-white h-11 text-base"
              :class="discType === 'fixed' ? 'pl-9' : ''"
            />
          </div>
        </div>

        <div class="rounded-lg bg-gray-800 p-3 mb-5">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-400">Potongan:</span>
            <span class="text-[#0ea5e9] font-semibold text-base">
              {{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(previewAmount) }}
            </span>
          </div>
        </div>

        <div class="flex gap-3">
          <Button
            v-if="currentType"
            variant="outline"
            class="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 h-11"
            @click="handleRemove"
          >
            Hapus Diskon
          </Button>
          <Button
            class="flex-1 bg-[#0ea5e9] hover:bg-[#0284c7] text-white h-11 text-base"
            :disabled="!discValue"
            @click="handleApply"
          >
            Terapkan
          </Button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
