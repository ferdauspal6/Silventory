import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/pages/auth/Login.vue'),
    },
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/dashboard' },
        {
          path: 'dashboard',
          name: 'Dashboard',
          meta: { title: 'Dashboard' },
          component: () => import('@/pages/dashboard/index.vue'),
        },
        {
          path: 'masters',
          children: [
            {
              path: 'categories',
              name: 'Categories',
              meta: { title: 'Kategori' },
              component: () => import('@/pages/masters/Categories.vue'),
            },
            {
              path: 'brands',
              name: 'Brands',
              meta: { title: 'Brand' },
              component: () => import('@/pages/masters/Brands.vue'),
            },
            {
              path: 'units',
              name: 'Units',
              meta: { title: 'Satuan' },
              component: () => import('@/pages/masters/Units.vue'),
            },
            {
              path: 'items',
              name: 'Items',
              meta: { title: 'Item Barang' },
              component: () => import('@/pages/masters/Items.vue'),
            },
            {
              path: 'suppliers',
              name: 'Suppliers',
              meta: { title: 'Supplier' },
              component: () => import('@/pages/masters/Suppliers.vue'),
            },
            {
              path: 'warehouses',
              name: 'Warehouses',
              meta: { title: 'Gudang / Proyek' },
              component: () => import('@/pages/masters/Warehouses.vue'),
            },
          ],
        },
        {
          path: 'stock',
          children: [
            {
              path: '',
              name: 'Stock',
              meta: { title: 'Stock Aktual' },
              component: () => import('@/pages/stock/index.vue'),
            },
            {
              path: 'low',
              name: 'LowStock',
              meta: { title: 'Stock Rendah' },
              component: () => import('@/pages/stock/LowStock.vue'),
            },
          ],
        },
        {
          path: 'transactions',
          children: [
            {
              path: 'requests',
              name: 'Requests',
              meta: { title: 'Request Item' },
              component: () => import('@/pages/transactions/Requests.vue'),
            },
            {
              path: 'receipts',
              name: 'Receipts',
              meta: { title: 'Penerimaan Barang' },
              component: () => import('@/pages/transactions/Receipts.vue'),
            },
            {
              path: 'transfers',
              name: 'Transfers',
              meta: { title: 'Transfer Stock' },
              component: () => import('@/pages/transactions/Transfers.vue'),
            },
            {
              path: 'opnames',
              name: 'Opnames',
              meta: { title: 'Stock Opname' },
              component: () => import('@/pages/transactions/Opnames.vue'),
            },
            {
              path: 'usages',
              name: 'Usages',
              meta: { title: 'Stock Usage' },
              component: () => import('@/pages/transactions/Usages.vue'),
            },
          ],
        },
        {
          path: 'activity',
          name: 'ActivityLog',
          meta: { title: 'Activity Log' },
          component: () => import('@/pages/activity/index.vue'),
        },
        {
          path: 'users',
          name: 'Users',
          meta: { title: 'User Management' },
          component: () => import('@/pages/users/index.vue'),
        },
      ],
    },
  ],
})

export default router
