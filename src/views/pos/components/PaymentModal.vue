<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Button, Input } from '@/components/ui'
import { Check, X, Printer, RefreshCw, Loader2 } from '@lucide/vue'

const props = defineProps<{
  open: boolean
  total: number
  subtotal: number
  discountAmount: number
  itemCount: number
  submitting: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: [paidAmount: number]
  newTransaction: []
}>()

const amountReceived = ref(0)

const quickAmounts = [10000, 20000, 50000, 100000]

const change = computed(() => Math.max(0, amountReceived.value - props.total))

const isEnough = computed(() => amountReceived.value >= props.total)

watch(() => props.open, (val) => {
  if (val) amountReceived.value = 0
})

function setQuickAmount(amt: number) {
  amountReceived.value = amt
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60" @click.self="emit('close')">
      <div class="w-full max-w-md rounded-xl bg-[#1a1f2e] border border-gray-700 p-6 shadow-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-lg font-semibold text-white">Pembayaran</h3>
          <button @click="emit('close')" class="p-1 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
            <X class="h-5 w-5" />
          </button>
        </div>

        <!-- Ringkasan -->
        <div class="rounded-lg bg-gray-800/50 p-4 mb-5 space-y-2">
          <div class="flex justify-between text-sm text-gray-400">
            <span>Jumlah Item</span>
            <span>{{ itemCount }} item</span>
          </div>
          <div class="flex justify-between text-sm text-gray-400">
            <span>Subtotal</span>
            <span>{{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(subtotal) }}</span>
          </div>
          <div v-if="discountAmount > 0" class="flex justify-between text-sm text-green-400">
            <span>Diskon</span>
            <span>-{{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(discountAmount) }}</span>
          </div>
          <div class="border-t border-gray-700 pt-2 flex justify-between text-white font-bold text-xl">
            <span>Total</span>
            <span class="text-[#0ea5e9]">{{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(total) }}</span>
          </div>
        </div>

        <!-- Input Uang Diterima -->
        <div class="mb-4">
          <label class="text-sm text-gray-400 mb-1.5 block">Uang Diterima</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">Rp</span>
            <Input
              v-model.number="amountReceived"
              type="number"
              min="0"
              placeholder="0"
              class="bg-gray-800 border-gray-600 text-white h-12 text-xl font-bold pl-10"
            />
          </div>
        </div>

        <!-- Quick buttons -->
        <div class="grid grid-cols-4 gap-2 mb-5">
          <button
            v-for="amt in quickAmounts"
            :key="amt"
            @click="setQuickAmount(amt)"
            class="h-11 rounded-lg bg-gray-800 border border-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            :class="{ 'bg-[#0ea5e9]/20 border-[#0ea5e9]/50 text-[#0ea5e9]': amountReceived === amt }"
          >
            Rp{{ (amt / 1000).toFixed(0) }}rb
          </button>
        </div>

        <!-- Kembalian -->
        <div v-if="amountReceived > 0" class="rounded-lg bg-gray-800 p-4 mb-5">
          <div class="flex justify-between text-sm">
            <span class="text-gray-400">Kembalian</span>
            <span class="text-green-400 font-bold text-xl">
              {{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(change) }}
            </span>
          </div>
        </div>

        <!-- Tombol -->
        <div class="flex gap-3">
          <Button
            variant="outline"
            class="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 h-12 text-base"
            @click="emit('close')"
          >
            Batal
          </Button>
          <Button
            class="flex-1 bg-[#0ea5e9] hover:bg-[#0284c7] text-white h-12 text-base font-semibold"
            :disabled="!isEnough || submitting"
            @click="emit('confirm', amountReceived)"
          >
            <Loader2 v-if="submitting" class="mr-2 h-5 w-5 animate-spin" />
            <Check v-else class="mr-2 h-5 w-5" />
            Bayar Rp{{ new Intl.NumberFormat('id-ID', { currency: 'IDR', minimumFractionDigits: 0 }).format(total) }}
          </Button>
        </div>

        <!-- Success state -->
        <div v-if="false" class="text-center py-6">
          <div class="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <Check class="h-8 w-8 text-green-400" />
          </div>
          <h3 class="text-white text-lg font-semibold mb-1">Pembayaran Berhasil</h3>
          <p class="text-gray-400 text-sm mb-4">Struk sedang diproses</p>
          <div class="flex gap-3 justify-center">
            <Button variant="outline" class="border-gray-600 text-gray-300">
              <Printer class="mr-2 h-4 w-4" /> Cetak Struk
            </Button>
            <Button class="bg-[#0ea5e9] hover:bg-[#0284c7] text-white" @click="emit('newTransaction')">
              <RefreshCw class="mr-2 h-4 w-4" /> Transaksi Baru
            </Button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
