import { ref, reactive } from 'vue'

export function useFormDialog<T extends Record<string, any>>(defaultForm: T) {
  const open = ref(false)
  const editing = ref(false)
  const form = reactive<T>({ ...defaultForm }) as T
  const submitting = ref(false)

  function openCreate() {
    editing.value = false
    Object.assign(form, { ...defaultForm })
    open.value = true
  }

  function openEdit(data: Record<string, any>) {
    editing.value = true
    Object.assign(form, { ...defaultForm, ...data })
    open.value = true
  }

  function close() {
    open.value = false
  }

  return { open, editing, form, submitting, openCreate, openEdit, close }
}
