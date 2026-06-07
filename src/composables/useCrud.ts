import { ref, type Ref } from 'vue'

export function useCrud<T extends Record<string, any>>(
  fetchFn: (...args: any[]) => Promise<any>,
  createFn?: (...args: any[]) => Promise<any>,
  updateFn?: (...args: any[]) => Promise<any>,
  deleteFn?: (...args: any[]) => Promise<any>,
) {
  const items = ref<T[]>([]) as Ref<T[]>
  const loading = ref(false)
  const error = ref('')

  async function fetchData(...args: any[]) {
    loading.value = true
    error.value = ''
    try {
      const res = await fetchFn(...args)
      if (res.success) {
        items.value = (res.data as any[]) as T[]
      } else {
        error.value = res.message || 'Failed to fetch data'
      }
    } catch (err: any) {
      error.value = err.message || 'Network error'
    } finally {
      loading.value = false
    }
  }

  async function createItem(data: any) {
    if (!createFn) return null
    try {
      const res = await createFn(data)
      if (res.success) {
        await fetchData()
        return res.data
      }
      error.value = res.message
      return null
    } catch (err: any) {
      error.value = err.message
      return null
    }
  }

  async function updateItem(id: string, data: any) {
    if (!updateFn) return null
    try {
      const res = await updateFn({ id, ...data })
      if (res.success) {
        await fetchData()
        return res.data
      }
      error.value = res.message
      return null
    } catch (err: any) {
      error.value = err.message
      return null
    }
  }

  async function deleteItem(id: string) {
    if (!deleteFn) return false
    try {
      const res = await deleteFn(id)
      if (res.success) {
        await fetchData()
        return true
      }
      error.value = res.message
      return false
    } catch (err: any) {
      error.value = err.message
      return false
    }
  }

  return { items, loading, error, fetchData, createItem, updateItem, deleteItem }
}
