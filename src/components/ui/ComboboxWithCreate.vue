<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Input, Button } from '@/components/ui'
import { Loader2, Check, Plus, Search } from '@lucide/vue'

const props = withDefaults(defineProps<{
  modelValue: string
  options: { id: string; name: string }[]
  placeholder?: string
  createLabel?: string
  onCreateNew?: (name: string) => Promise<{ id: string; name: string }>
}>(), {
  placeholder: 'Pilih...',
  createLabel: 'Tambah',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const open = ref(false)
const searchQuery = ref('')
const creating = ref(false)
const showForm = ref(false)
const newName = ref('')
const newDescription = ref('')
const triggerRef = ref<HTMLElement | null>(null)
const dropdownStyle = ref({})

watch(open, (val) => {
  if (val && triggerRef.value) {
    const rect = triggerRef.value.getBoundingClientRect()
    dropdownStyle.value = {
      left: rect.left + 'px',
      top: (rect.bottom + 4) + 'px',
      width: rect.width + 'px',
    }
  }
})

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options
  const q = searchQuery.value.toLowerCase()
  return props.options.filter(o => o.name.toLowerCase().includes(q))
})

const showCreateOption = computed(() => {
  if (!props.onCreateNew) return false
  if (!searchQuery.value) return false
  return !filteredOptions.value.some(o => o.name.toLowerCase() === searchQuery.value.toLowerCase())
})

const selectedName = computed(() => {
  const found = props.options.find(o => o.id === props.modelValue)
  return found ? found.name : ''
})

function toggle() {
  open.value = !open.value
  if (open.value) {
    searchQuery.value = ''
    showForm.value = false
  }
}

function select(id: string) {
  emit('update:modelValue', id)
  open.value = false
  searchQuery.value = ''
}

function openCreateForm() {
  showForm.value = true
}

async function handleCreate() {
  if (!newName.value || !props.onCreateNew) return
  creating.value = true
  try {
    const result = await props.onCreateNew(newName.value)
    emit('update:modelValue', result.id)
    open.value = false
    showForm.value = false
    newName.value = ''
    newDescription.value = ''
    searchQuery.value = ''
  } finally {
    creating.value = false
  }
}

function closeCreateForm() {
  showForm.value = false
  newName.value = ''
  newDescription.value = ''
}
</script>

<template>
  <div class="relative" ref="triggerRef">
    <button
      type="button"
      @click="toggle"
      class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span :class="selectedName ? 'text-foreground' : 'text-muted-foreground'">
        {{ selectedName || placeholder }}
      </span>
      <svg
        class="h-4 w-4 shrink-0 opacity-50"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>

    <div
      v-if="open"
      class="fixed inset-0 z-50"
      @click.self="open = false"
    >
      <div
        class="absolute z-50 rounded-lg border bg-popover text-popover-foreground shadow-md outline-none"
        :style="dropdownStyle"
      >
        <!-- Search -->
        <div class="flex items-center border-b px-3">
          <Search class="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            v-model="searchQuery"
            :placeholder="`Cari ${placeholder.toLowerCase()}...`"
            class="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            autofocus
          />
        </div>

        <!-- Options list -->
        <div class="max-h-60 overflow-y-auto p-1">
          <button
            v-for="opt in filteredOptions"
            :key="opt.id"
            @click="select(opt.id)"
            class="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            :class="opt.id === modelValue ? 'bg-accent text-accent-foreground' : ''"
          >
            <Check
              v-if="opt.id === modelValue"
              class="mr-2 h-4 w-4 shrink-0"
            />
            <span v-else class="mr-2 h-4 w-4 shrink-0" />
            {{ opt.name }}
          </button>

          <!-- Create new option -->
          <button
            v-if="showCreateOption && !showForm"
            @click="openCreateForm"
            class="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground font-medium"
            style="color: hsl(var(--primary))"
          >
            <Plus class="mr-2 h-4 w-4 shrink-0" />
            + {{ createLabel }} '{{ searchQuery }}'
          </button>

          <div v-if="!filteredOptions.length && !showCreateOption" class="py-6 text-center text-sm text-muted-foreground">
            Tidak ada data
          </div>
        </div>

        <!-- Inline create form -->
        <div v-if="showForm" class="border-t p-3 space-y-2">
          <h4 class="text-sm font-medium">{{ createLabel }} Baru</h4>
          <Input
            v-model="newName"
            placeholder="Nama"
            required
          />
          <div class="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" @click="closeCreateForm">Batal</Button>
            <Button
              type="button"
              size="sm"
              :disabled="creating || !newName"
              @click="handleCreate"
            >
              <Loader2 v-if="creating" class="mr-1 h-3 w-3 animate-spin" />
              Simpan
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
