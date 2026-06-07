<script setup lang="ts">
import {
  ArrowUpDown, ChevronDown, HardHat, AlertTriangle, CheckCircle, Clock, MoreHorizontal
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
  location: string
  status: string
  progress: number
  deadline: string
  pic: string
}

const data: Project[] = [
  { name: 'Royal Garden Residence', location: 'Jakarta Selatan', status: 'Ongoing', progress: 65, deadline: '2026-09-30', pic: 'Ahmad Fauzi' },
  { name: 'Grand City Park Fase 2', location: 'Bandung', status: 'Ongoing', progress: 42, deadline: '2026-12-15', pic: 'Budi Santoso' },
  { name: 'The Savanna Hills', location: 'Bogor', status: 'Planning', progress: 15, deadline: '2027-03-01', pic: 'Citra Dewi' },
  { name: 'Green Lake View', location: 'Depok', status: 'Completed', progress: 100, deadline: '2026-05-15', pic: 'Doni Prasetyo' },
  { name: 'Metro City Square', location: 'Jakarta Pusat', status: 'On Hold', progress: 30, deadline: '2026-08-20', pic: 'Eka Putri' },
  { name: 'Hilltop Residence', location: 'Bogor', status: 'Ongoing', progress: 78, deadline: '2026-07-10', pic: 'Fajar Hidayat' },
]

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Ongoing: 'bg-blue-100 text-blue-700',
    Planning: 'bg-amber-100 text-amber-700',
    Completed: 'bg-green-100 text-green-700',
    'On Hold': 'bg-red-100 text-red-700',
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
    accessorKey: 'deadline',
    header: ({ column }) => h(Button, {
      variant: 'ghost',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    }, () => ['Deadline', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]),
    cell: ({ row }) => h('span', { class: 'text-gray-500' }, row.getValue('deadline')),
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
      <h1 class="text-2xl font-bold text-gray-900">Dashboard Konstruksi</h1>
      <p class="text-gray-500 mt-1">Monitoring proyek konstruksi Cita Group</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card class="bg-white">
        <CardContent class="p-5 flex items-center gap-4">
          <div class="rounded-lg bg-blue-100 p-3">
            <HardHat class="h-6 w-6 text-primary" />
          </div>
          <div>
            <p class="text-sm text-gray-500">Total Proyek</p>
            <p class="text-2xl font-bold text-gray-900">6</p>
          </div>
        </CardContent>
      </Card>
      <Card class="bg-white">
        <CardContent class="p-5 flex items-center gap-4">
          <div class="rounded-lg bg-green-100 p-3">
            <CheckCircle class="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p class="text-sm text-gray-500">Selesai</p>
            <p class="text-2xl font-bold text-gray-900">1</p>
          </div>
        </CardContent>
      </Card>
      <Card class="bg-white">
        <CardContent class="p-5 flex items-center gap-4">
          <div class="rounded-lg bg-amber-100 p-3">
            <Clock class="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p class="text-sm text-gray-500">Berjalan</p>
            <p class="text-2xl font-bold text-gray-900">3</p>
          </div>
        </CardContent>
      </Card>
      <Card class="bg-white">
        <CardContent class="p-5 flex items-center gap-4">
          <div class="rounded-lg bg-red-100 p-3">
            <AlertTriangle class="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p class="text-sm text-gray-500">Tertunda</p>
            <p class="text-2xl font-bold text-gray-900">1</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <Card class="bg-white">
      <CardHeader class="flex flex-row items-center justify-between">
        <CardTitle>Daftar Proyek</CardTitle>
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
                {{ column.id === 'name' ? 'Nama Proyek' : column.id === 'location' ? 'Lokasi' : column.id === 'status' ? 'Status' : column.id === 'progress' ? 'Progress' : column.id === 'deadline' ? 'Deadline' : column.id === 'pic' ? 'PIC' : column.id }}
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
