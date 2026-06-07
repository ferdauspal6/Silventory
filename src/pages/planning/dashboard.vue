<script setup lang="ts">
import {
  ArrowUpDown, ChevronDown, HardHat, Users, Truck, Wallet, ArrowUpRight, ArrowDownRight, MoreHorizontal
} from '@lucide/vue'
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
  Button, Card, CardContent, CardHeader, CardTitle,
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
  Input,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui'

interface Project {
  name: string
  status: string
  progress: number
  location: string
}

const stats = [
  { label: 'Proyek Aktif', value: '12', icon: HardHat, change: '+2', positive: true },
  { label: 'Total Karyawan', value: '246', icon: Users, change: '+8', positive: true },
  { label: 'Pengiriman Bulan Ini', value: '34', icon: Truck, change: '-3', positive: false },
  { label: 'Anggaran Tersedia', value: 'Rp 2,1M', icon: Wallet, change: '+12%', positive: true },
]

const data: Project[] = [
  { name: 'Royal Garden Residence', status: 'Ongoing', progress: 65, location: 'Jakarta Selatan' },
  { name: 'Grand City Park Fase 2', status: 'Ongoing', progress: 42, location: 'Bandung' },
  { name: 'The Savanna Hills', status: 'Planning', progress: 15, location: 'Bogor' },
  { name: 'Green Lake View', status: 'Completed', progress: 100, location: 'Depok' },
]

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Completed: 'bg-green-100 text-green-700',
    Ongoing: 'bg-blue-100 text-blue-700',
    Planning: 'bg-amber-100 text-amber-700',
  }
  return map[status] || 'bg-gray-100 text-gray-700'
}

const columns: ColumnDef<Project>[] = [
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
      const status = row.getValue('status') as string
      return h('span', { class: `inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge(status)}` }, status)
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
        h('div', { class: 'flex-1 h-2 rounded-full bg-gray-100 max-w-[120px]' }, [
          h('div', {
            class: `h-2 rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-primary'}`,
            style: { width: `${progress}%` },
          }),
        ]),
        h('span', { class: 'text-xs text-gray-500 w-8 text-right' }, `${progress}%`),
      ])
    },
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
      <h1 class="text-2xl font-bold text-gray-900">Dashboard Planning</h1>
      <p class="text-gray-500 mt-1">Ringkasan keseluruhan aktivitas Cita Group</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card v-for="stat in stats" :key="stat.label" class="bg-white">
        <CardContent class="p-5">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm text-gray-500">{{ stat.label }}</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ stat.value }}</p>
              <div class="flex items-center gap-1 mt-2">
                <component :is="stat.positive ? ArrowUpRight : ArrowDownRight" class="h-4 w-4" :class="stat.positive ? 'text-green-500' : 'text-red-500'" />
                <span class="text-sm font-medium" :class="stat.positive ? 'text-green-600' : 'text-red-600'">{{ stat.change }}</span>
                <span class="text-xs text-gray-400">bulan lalu</span>
              </div>
            </div>
            <div class="rounded-lg bg-primary/10 p-2.5">
              <component :is="stat.icon" class="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <Card class="bg-white">
      <CardHeader class="flex flex-row items-center justify-between">
        <CardTitle>Proyek Terbaru</CardTitle>
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
                {{ column.id === 'name' ? 'Nama Proyek' : column.id === 'location' ? 'Lokasi' : column.id === 'status' ? 'Status' : column.id === 'progress' ? 'Progress' : column.id }}
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
