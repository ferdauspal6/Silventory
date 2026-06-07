<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CheckCircle, Info, HelpCircle, Bell, BellDot } from '@lucide/vue'
import { useNotificationStore, type NotificationItem } from '@/stores/notification'
import { Button, Card, CardContent, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'

const store = useNotificationStore()
const router = useRouter()

const filterTypes = ref<string[]>([])
const activeTab = ref('all')

const typeColors: Record<string, { bg: string, text: string, icon: any }> = {
  approval: { bg: 'bg-amber-100', text: 'text-amber-700', icon: CheckCircle },
  info: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Info },
  request: { bg: 'bg-purple-100', text: 'text-purple-700', icon: HelpCircle },
}

const typeLabels: Record<string, string> = {
  approval: 'Approval',
  info: 'Info',
  request: 'Request',
}

const tabLabels: Record<string, string> = {
  all: 'Semua',
  unread: 'Belum Dibaca',
  read: 'Dibaca',
}

function toggleFilter(type: string) {
  if (filterTypes.value.includes(type)) {
    filterTypes.value = filterTypes.value.filter(t => t !== type)
  } else {
    filterTypes.value.push(type)
  }
}

const filteredNotifications = computed(() => {
  let list = store.notifications

  if (activeTab.value === 'unread') list = list.filter(n => !n.read)
  else if (activeTab.value === 'read') list = list.filter(n => n.read)

  if (filterTypes.value.length) list = list.filter(n => filterTypes.value.includes(n.type))

  return list
})

function timeAgo(dateStr: string) {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Baru saja'
  if (mins < 60) return `${mins} menit lalu`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} hari lalu`
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function handleClick(item: NotificationItem) {
  store.markAsRead(item.id)
  if (item.link) router.push(item.link)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Pusat Notifikasi</h1>
        <p class="text-gray-500 mt-1">{{ store.notifications.length }} notifikasi • {{ store.unreadCount }} belum dibaca</p>
      </div>
      <Button variant="outline" size="sm" @click="store.markAllAsRead()" v-if="store.unreadCount > 0">
        Tandai Semua Dibaca
      </Button>
    </div>

    <Card class="bg-white">
      <CardContent class="p-0">
        <Tabs default-value="all" @update:model-value="(v: any) => activeTab = String(v)">
          <div class="border-b px-6 pt-4">
            <TabsList class="mb-0">
              <TabsTrigger v-for="(label, key) in tabLabels" :key="key" :value="key" class="text-sm">
                {{ label }}
                <span v-if="key === 'unread'" class="ml-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">{{ store.unreadCount }}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div class="px-6 py-4 border-b">
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-500">Filter:</span>
              <button
                v-for="(label, key) in typeLabels"
                :key="key"
                class="rounded-full px-3 py-1 text-xs font-medium transition-colors"
                :class="filterTypes.includes(key) ? `${typeColors[key].bg} ${typeColors[key].text}` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                @click="toggleFilter(key)"
              >
                {{ label }}
              </button>
            </div>
          </div>

          <TabsContent v-for="(label, key) in tabLabels" :key="key" :value="key" class="m-0">
            <div v-if="filteredNotifications.length" class="divide-y">
              <div
                v-for="item in filteredNotifications"
                :key="item.id"
                class="flex items-start gap-4 px-6 py-4 cursor-pointer transition-colors hover:bg-gray-50"
                :class="{ 'bg-blue-50/30': !item.read }"
                @click="handleClick(item)"
              >
                <div class="rounded-full p-2 flex-shrink-0" :class="typeColors[item.type].bg">
                  <component :is="typeColors[item.type].icon" class="h-4 w-4" :class="typeColors[item.type].text" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2">
                    <p class="text-sm font-medium" :class="item.read ? 'text-gray-700' : 'text-gray-900'">
                      {{ item.title }}
                      <span v-if="!item.read" class="inline-block ml-1.5 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 align-middle" />
                    </p>
                    <span class="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">{{ timeAgo(item.createdAt) }}</span>
                  </div>
                  <p class="text-sm text-gray-500 mt-0.5 line-clamp-2">{{ item.message }}</p>
                  <span v-if="item.module" class="inline-block mt-1.5 text-xs text-gray-400">{{ item.module }}</span>
                </div>
              </div>
            </div>

            <div v-else class="flex flex-col items-center justify-center py-16 text-gray-400">
              <Bell class="h-12 w-12 mb-3" />
              <p class="text-sm font-medium">Tidak ada notifikasi</p>
              <p class="text-xs mt-1">Kamu akan melihat notifikasi baru di sini</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  </div>
</template>
