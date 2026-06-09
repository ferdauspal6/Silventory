import { ref, onMounted, onUnmounted } from 'vue'
import { usePosStore } from '@/stores/pos'

export function usePos() {
  const store = usePosStore()
  const searchFocused = ref(false)

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'F2') {
      e.preventDefault()
      searchFocused.value = true
    }
    if (e.key === 'F10') {
      e.preventDefault()
      return true
    }
    if (e.key === 'Escape') {
      return true
    }
    return false
  }

  function formatCurrency(val: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val)
  }

  return {
    store,
    searchFocused,
    handleKeydown,
    formatCurrency,
  }
}
