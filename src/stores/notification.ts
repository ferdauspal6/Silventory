import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface NotificationItem {
  id: string
  title: string
  message: string
  type: 'approval' | 'info' | 'request'
  read: boolean
  createdAt: string
  module?: string
  link?: string
}

const mockNotifications: NotificationItem[] = [
  { id: 'N001', title: 'Persetujuan Request PRJ-001', message: 'Pengajuan material menunggu persetujuan Anda', type: 'approval', read: false, createdAt: new Date().toISOString(), module: 'Inventory' },
  { id: 'N002', title: 'Stock Rendah', message: 'Beberapa item memiliki stock di bawah minimum', type: 'info', read: false, createdAt: new Date(Date.now() - 3600000).toISOString(), module: 'Stock' },
  { id: 'N003', title: 'Penerimaan Barang', message: 'Receipt baru perlu dikonfirmasi', type: 'request', read: false, createdAt: new Date(Date.now() - 7200000).toISOString(), module: 'Receipt' },
]

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<NotificationItem[]>(mockNotifications)

  const unreadCount = computed(() => notifications.value.filter((n: NotificationItem) => !n.read).length)

  function markAsRead(id: string) {
    const n = notifications.value.find((item: NotificationItem) => item.id === id)
    if (n) n.read = true
  }

  function markAllAsRead() {
    notifications.value.forEach((n: NotificationItem) => { n.read = true })
  }

  return { notifications, unreadCount, markAsRead, markAllAsRead }
})
