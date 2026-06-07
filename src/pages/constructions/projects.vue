<script setup lang="ts">
import { ArrowUpDown, ChevronDown, MoreHorizontal } from '@lucide/vue'
import type { ColumnDef, SortingState, VisibilityState } from '@tanstack/vue-table'
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import { h, ref } from 'vue'
import { valueUpdater } from '@/lib/utils'
import {
  Badge, Button, Card, CardContent, CardHeader, CardTitle,
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
  Input,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui'

interface Project {
  id: string
  name: string
  location: string
  status: 'ongoing' | 'completed' | 'planning' | 'on-hold'
  progress: number
  budget: string
  pic: string
}

const data: Project[] = [
  { id: 'PRJ-001', name: 'Royal Garden Residence', location: 'Jakarta Selatan', status: 'ongoing', progress: 65, budget: 'Rp 45M', pic: 'Ahmad Fauzi' },
  { id: 'PRJ-002', name: 'Grand City Park Fase 2', location: 'Bandung', status: 'ongoing', progress: 42, budget: 'Rp 78M', pic: 'Budi Santoso' },
  { id: 'PRJ-003', name: 'The Savanna Hills', location: 'Bogor', status: 'planning', progress: 15, budget: 'Rp 120M', pic: 'Citra Dewi' },
  { id: 'PRJ-004', name: 'Green Lake View', location: 'Depok', status: 'completed', progress: 100, budget: 'Rp 32M', pic: 'Doni Prasetyo' },
  { id: 'PRJ-005', name: 'Metro City Square', location: 'Jakarta Pusat', status: 'on-hold', progress: 30, budget: 'Rp 95M', pic: 'Eka Putri' },
  { id: 'PRJ-006', name: 'Hilltop Residence', location: 'Bogor', status: 'ongoing', progress: 78, budget: 'Rp 55M', pic: 'Fajar Hidayat' },
]

const badgeVariant: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  ongoing: 'default',
  completed: 'success',
  planning: 'warning',
  'on-hold': 'destructive',
}

const statusLabel: Record<string, string> = {
  ongoing: 'Berjalan',
  completed: 'Selesai',
  planning: 'Perencanaan',
  'on-hold': 'Ditunda',
}

const columns: ColumnDef<Project>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => h('span', { class: 'text-gray-500 font-mono text-xs' }, row.getValue('id')),
  },
  {
    accessorKey: 'name',
    header: ({ column }) => h(Button, {
      variant: 'ghost',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    }, () => ['Nama Proyek', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]),
    cell: ({ row }) => h('div', { class: 'font-medium text-gray-900' }, row.getValue('name')),
  },
  {
    accessorKey: 'location',
    header: 'Lokasi',
    cell: ({ row }) => h('span', { class: 'text-gray-500' }, row.getValue('location')),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as keyof typeof badgeVariant
      return h(Badge, { variant: badgeVariant[status] }, () => statusLabel[status])
    },
  },
  {
    accessorKey: 'progress',
    header: ({ column }) => h(Button, {
      variant: 'ghost',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    }, () => ['Progress', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]),
    cell: ({ row }) => {
      const progress = row.getValue('progress') as number
      return h('div', { class: 'flex items-center gap-3' }, [
        h('div', { class: 'w-24 h-2 rounded-full bg-gray-100' }, [
          h('div', {
            class: `h-2 rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-primary'}`,
            style: { width: `${progress}%` },
          }),
        ]),
        h('span', { class: 'text-xs text-gray-500' }, `${progress}%`),
      ])
    },
  },
  {
    accessorKey: 'budget',
    header: 'Anggaran',
    cell: ({ row }) => h('span', { class: 'text-gray-700' }, row.getValue('budget')),
  },
  {
    accessorKey: 'pic',
    header: 'PIC',
    cell: ({ row }) => h('span', { class: 'text-gray-700' }, row.getValue('pic')),
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: () => h(DropdownMenu, () => ({
      default: () => [
        h(DropdownMenuTrigger, { asChild: true }, () => h(Button, { variant: 'ghost', class: 'h-8 w-8 p-0' }, () => [
          h('span', { class: 'sr-only' }, 'Buka menu'),
          h(MoreHorizontal, { class: 'h-4 w-4' }),
        ])),
        h(DropdownMenuContent, { align: 'end' }, () => [
          h(DropdownMenuLabel, 'Aksi'),
          h(DropdownMenuSeparator),
          h(DropdownMenuItem, 'Lihat detail'),
          h(DropdownMenuItem, 'Edit proyek'),
        ]),
      ],
    })),
  },
]

const sorting = ref<SortingState>([])
const columnFilters = ref([])
const columnVisibility = ref<VisibilityState>({})
const rowSelection = ref({})

const table = useVueTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  onSortingChange: updaterOrValue => valueUpdater(updaterOrValue, sorting),
  onColumnFiltersChange: updaterOrValue => valueUpdater(updaterOrValue, columnFilters),
  onColumnVisibilityChange: updaterOrValue => valueUpdater(updaterOrValue, columnVisibility),
  onRowSelectionChange: updaterOrValue => valueUpdater(updaterOrValue, rowSelection),
  state: {
    get sorting() { return sorting.value },
    get columnFilters() { return columnFilters.value },
    get columnVisibility() { return columnVisibility.value },
    get rowSelection() { return rowSelection.value },
  },
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Daftar Proyek</h1>
      <p class="text-gray-500 mt-1">Kelola semua proyek konstruksi</p>
    </div>

    <Card class="bg-white">
      <CardHeader class="flex flex-row items-center justify-between">
        <CardTitle>Semua Proyek</CardTitle>
        <div class="flex items-center gap-2">
          <Input
            class="max-w-sm"
            placeholder="Cari proyek..."
            :model-value="table.getColumn('name')?.getFilterValue() as string"
            @update:model-value="table.getColumn('name')?.setFilterValue($event)"
          />
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="outline" class="ml-auto">
                Kolom <ChevronDown class="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                v-for="column in table.getAllColumns().filter(c => c.getCanHide())"
                :key="column.id"
                class="capitalize"
                :model-value="column.getIsVisible()"
                @update:model-value="(value) => column.toggleVisibility(!!value)"
              >
                {{ column.id === 'name' ? 'Nama Proyek' : column.id === 'location' ? 'Lokasi' : column.id === 'status' ? 'Status' : column.id === 'progress' ? 'Progress' : column.id === 'budget' ? 'Anggaran' : column.id === 'pic' ? 'PIC' : column.id }}
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
                <TableHead v-for="header in headerGroup.headers" :key="header.id">
                  <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header" :props="header.getContext()" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="row in table.getRowModel().rows" :key="row.id" :data-state="row.getIsSelected() && 'selected'">
                <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                  <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div class="flex items-center justify-end space-x-2 py-4">
          <div class="flex-1 text-sm text-muted-foreground">
            {{ table.getFilteredSelectedRowModel().rows.length }} of {{ table.getFilteredRowModel().rows.length }} row(s) selected.
          </div>
          <div class="space-x-2">
            <Button variant="outline" size="sm" :disabled="!table.getCanPreviousPage()" @click="table.previousPage()">
              Previous
            </Button>
            <Button variant="outline" size="sm" :disabled="!table.getCanNextPage()" @click="table.nextPage()">
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
