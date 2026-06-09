import axios from 'axios'
import type { ApiResponse } from '@/types'

const DEPLOYMENT_URL = 'https://script.google.com/macros/s/AKfycbyuOBOy7ie9qIfUq0FeEMJPvs2IkyIJdHAwV2_-7be5zdkN89YT8h6KVy69GrwWHW2U/exec'

const api = axios.create({
  baseURL: DEPLOYMENT_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'text/plain' },
  transformRequest: [(data) => JSON.stringify(data)],
})

api.interceptors.response.use(
  (res) => {
    if (res.data?.success === false) {
      return Promise.reject(new Error(res.data.error || res.data.message || 'Request failed'))
    }
    return res
  },
  (err) => {
    if (err.response?.data?.error) {
      return Promise.reject(new Error(err.response.data.error))
    }
    return Promise.reject(err)
  }
)

async function get<T = any>(params: Record<string, any>): Promise<ApiResponse<T>> {
  const res = await api.get<ApiResponse<T>>('', { params })
  return res.data
}

async function post<T = any>(payload: Record<string, any>): Promise<ApiResponse<T>> {
  const res = await api.post<ApiResponse<T>>('', payload)
  return res.data
}

export const apiService = {
  // Auth
  login: (email: string, password: string) =>
    post<{ id: string; name: string; email: string; role: string; is_active: boolean }>({
      action: 'login',
      email,
      password,
    }),

  // Categories
  getCategories: (is_active?: string) => get<Record<string, any>[]>({ action: 'getCategories', is_active: is_active || '' }),
  createCategory: (data: { name: string; description?: string }) => post<Record<string, any>>({ action: 'createCategory', ...data }),
  updateCategory: (data: { id: string; name?: string; description?: string; is_active?: boolean }) =>
    post<Record<string, any>>({ action: 'updateCategory', ...data }),
  deleteCategory: (id: string) => post<Record<string, any>>({ action: 'deleteCategory', id }),

  // Brands
  getBrands: () => get<Record<string, any>[]>({ action: 'getBrands' }),
  createBrand: (data: { name: string; description?: string }) => post<Record<string, any>>({ action: 'createBrand', ...data }),
  updateBrand: (data: { id: string; name?: string; description?: string; is_active?: boolean }) =>
    post<Record<string, any>>({ action: 'updateBrand', ...data }),
  deleteBrand: (id: string) => post<Record<string, any>>({ action: 'deleteBrand', id }),

  // Units
  getUnits: () => get<Record<string, any>[]>({ action: 'getUnits' }),
  createUnit: (data: { name: string; abbreviation: string }) => post<Record<string, any>>({ action: 'createUnit', ...data }),
  updateUnit: (data: { id: string; name?: string; abbreviation?: string; is_active?: boolean }) =>
    post<Record<string, any>>({ action: 'updateUnit', ...data }),
  deleteUnit: (id: string) => post<Record<string, any>>({ action: 'deleteUnit', id }),

  // Items
  getItems: (category_id?: string, is_active?: string) =>
    get<Record<string, any>[]>({ action: 'getItems', category_id: category_id || '', is_active: is_active || '' }),
  getItemById: (id: string) => get<Record<string, any>>({ action: 'getItemById', id }),
  createItem: (data: { code: string; name: string; category_id: string; brand_id: string; unit_id: string; min_stock?: number; price?: number; description?: string }) =>
    post<Record<string, any>>({ action: 'createItem', ...data }),
  updateItem: (data: { id: string; code?: string; name?: string; category_id?: string; brand_id?: string; unit_id?: string; min_stock?: number; price?: number; description?: string; is_active?: boolean }) =>
    post<Record<string, any>>({ action: 'updateItem', ...data }),
  deleteItem: (id: string) => post<Record<string, any>>({ action: 'deleteItem', id }),

  // Suppliers
  getSuppliers: () => get<Record<string, any>[]>({ action: 'getSuppliers' }),
  getSupplierById: (id: string) => get<Record<string, any>>({ action: 'getSupplierById', id }),
  createSupplier: (data: { code: string; name: string; contact_person?: string; phone?: string; email?: string; address?: string }) =>
    post<Record<string, any>>({ action: 'createSupplier', ...data }),
  updateSupplier: (data: { id: string; code?: string; name?: string; contact_person?: string; phone?: string; email?: string; address?: string; is_active?: boolean }) =>
    post<Record<string, any>>({ action: 'updateSupplier', ...data }),
  deleteSupplier: (id: string) => post<Record<string, any>>({ action: 'deleteSupplier', id }),

  // Warehouses
  getWarehouses: (type?: string, is_active?: string) =>
    get<Record<string, any>[]>({ action: 'getWarehouses', type: type || '', is_active: is_active || '' }),
  getWarehouseById: (id: string) => get<Record<string, any>>({ action: 'getWarehouseById', id }),
  createWarehouse: (data: { code: string; name: string; type: string; location?: string; person_in_charge?: string }) =>
    post<Record<string, any>>({ action: 'createWarehouse', ...data }),
  updateWarehouse: (data: { id: string; code?: string; name?: string; type?: string; location?: string; person_in_charge?: string; is_active?: boolean }) =>
    post<Record<string, any>>({ action: 'updateWarehouse', ...data }),
  deleteWarehouse: (id: string) => post<Record<string, any>>({ action: 'deleteWarehouse', id }),

  // Stock
  getStock: (warehouse_id?: string, item_id?: string) =>
    get<Record<string, any>[]>({ action: 'getStock', warehouse_id: warehouse_id || '', item_id: item_id || '' }),
  getLowStock: () => get<Record<string, any>[]>({ action: 'getLowStock' }),

  // Requests
  getRequests: (status?: string, requested_by?: string) =>
    get<Record<string, any>[]>({ action: 'getRequests', status: status || '', requested_by: requested_by || '' }),
  getRequestById: (id: string) => get<Record<string, any>>({ action: 'getRequestById', id }),
  createRequest: (data: { warehouse_id: string; notes?: string; requested_by?: string; details: { item_id: string; quantity_requested: number; notes?: string }[] }) =>
    post<Record<string, any>>({ action: 'createRequest', ...data }),
  updateRequest: (data: { id: string; notes?: string; details?: { item_id: string; quantity_requested: number; notes?: string }[] }) =>
    post<Record<string, any>>({ action: 'updateRequest', ...data }),
  submitRequest: (id: string, user_id?: string) => post<Record<string, any>>({ action: 'submitRequest', id, user_id: user_id || '' }),
  approveRequest: (id: string, approved_by: string) => post<Record<string, any>>({ action: 'approveRequest', id, approved_by }),
  rejectRequest: (id: string, approved_by: string, rejection_reason: string) =>
    post<Record<string, any>>({ action: 'rejectRequest', id, approved_by, rejection_reason }),
  deleteRequest: (id: string) => post<Record<string, any>>({ action: 'deleteRequest', id }),

  // Receipts
  getReceipts: (status?: string, warehouse_id?: string) =>
    get<Record<string, any>[]>({ action: 'getReceipts', status: status || '', warehouse_id: warehouse_id || '' }),
  getReceiptById: (id: string) => get<Record<string, any>>({ action: 'getReceiptById', id }),
  createReceipt: (data: { supplier_id: string; warehouse_id: string; receipt_date?: string; received_by?: string; request_id?: string; notes?: string; details: { item_id: string; quantity_received: number; notes?: string }[] }) =>
    post<Record<string, any>>({ action: 'createReceipt', ...data }),
  updateReceipt: (data: { id: string; supplier_id?: string; warehouse_id?: string; receipt_date?: string; notes?: string }) =>
    post<Record<string, any>>({ action: 'updateReceipt', ...data }),
  confirmReceipt: (id: string, user_id?: string) => post<Record<string, any>>({ action: 'confirmReceipt', id, user_id: user_id || '' }),
  deleteReceipt: (id: string) => post<Record<string, any>>({ action: 'deleteReceipt', id }),

  // Transfers
  getTransfers: (status?: string, from_warehouse_id?: string, to_warehouse_id?: string) =>
    get<Record<string, any>[]>({ action: 'getTransfers', status: status || '', from_warehouse_id: from_warehouse_id || '', to_warehouse_id: to_warehouse_id || '' }),
  getTransferById: (id: string) => get<Record<string, any>>({ action: 'getTransferById', id }),
  createTransfer: (data: { from_warehouse_id: string; to_warehouse_id: string; transfer_date?: string; transferred_by?: string; notes?: string; details: { item_id: string; quantity: number; notes?: string }[] }) =>
    post<Record<string, any>>({ action: 'createTransfer', ...data }),
  updateTransfer: (data: { id: string; from_warehouse_id?: string; to_warehouse_id?: string; transfer_date?: string; notes?: string }) =>
    post<Record<string, any>>({ action: 'updateTransfer', ...data }),
  confirmTransfer: (id: string, user_id?: string) => post<Record<string, any>>({ action: 'confirmTransfer', id, user_id: user_id || '' }),
  deleteTransfer: (id: string) => post<Record<string, any>>({ action: 'deleteTransfer', id }),

  // Opnames
  getOpnames: (status?: string, warehouse_id?: string) =>
    get<Record<string, any>[]>({ action: 'getOpnames', status: status || '', warehouse_id: warehouse_id || '' }),
  getOpnameById: (id: string) => get<Record<string, any>>({ action: 'getOpnameById', id }),
  createOpname: (data: { warehouse_id: string; opname_date?: string; conducted_by?: string; notes?: string; details: { item_id: string; quantity_system: number; quantity_actual: number; notes?: string }[] }) =>
    post<Record<string, any>>({ action: 'createOpname', ...data }),
  updateOpname: (data: { id: string; warehouse_id?: string; opname_date?: string; notes?: string }) =>
    post<Record<string, any>>({ action: 'updateOpname', ...data }),
  confirmOpname: (id: string, user_id?: string) => post<Record<string, any>>({ action: 'confirmOpname', id, user_id: user_id || '' }),
  deleteOpname: (id: string) => post<Record<string, any>>({ action: 'deleteOpname', id }),

  // Usages
  getUsages: (project_id?: string, status?: string) =>
    get<Record<string, any>[]>({ action: 'getUsages', project_id: project_id || '', status: status || '' }),
  getUsageById: (id: string) => get<Record<string, any>>({ action: 'getUsageById', id }),
  createUsage: (data: { project_id: string; input_type: string; usage_date?: string; recorded_by?: string; notes?: string; details: { item_id: string; quantity_input: number; notes?: string }[] }) =>
    post<Record<string, any>>({ action: 'createUsage', ...data }),
  updateUsage: (data: { id: string; project_id?: string; input_type?: string; usage_date?: string; notes?: string }) =>
    post<Record<string, any>>({ action: 'updateUsage', ...data }),
  confirmUsage: (id: string, user_id?: string) => post<Record<string, any>>({ action: 'confirmUsage', id, user_id: user_id || '' }),
  deleteUsage: (id: string) => post<Record<string, any>>({ action: 'deleteUsage', id }),

  // Dashboard
  getDashboardSummary: () => get<Record<string, any>>({ action: 'getDashboardSummary' }),
  getStockByWarehouse: (warehouse_id: string) => get<Record<string, any>[]>({ action: 'getStockByWarehouse', warehouse_id }),
  getRecentActivity: (limit?: number) => get<Record<string, any>[]>({ action: 'getRecentActivity', limit: limit || 10 }),

  // POS / Sales
  getSales: (warehouse_id?: string, status?: string) =>
    get<Record<string, any>[]>({ action: 'getSales', warehouse_id: warehouse_id || '', status: status || '' }),
  getSaleById: (id: string) => get<Record<string, any>>({ action: 'getSaleById', id }),
  createSale: (data: { warehouse_id: string; cashier_id?: string; sale_date?: string; notes?: string; discount_type?: string; discount_value?: number; details: { item_id: string; quantity: number; price_at_sale: number; discount_type?: string; discount_value?: number }[] }) =>
    post<Record<string, any>>({ action: 'createSale', ...data }),
  voidSale: (id: string, user_id?: string) => post<Record<string, any>>({ action: 'voidSale', id, user_id: user_id || '' }),
  getDailySummary: (date?: string, warehouse_id?: string) =>
    get<Record<string, any>>({ action: 'getDailySummary', date: date || '', warehouse_id: warehouse_id || '' }),

  // Users (Manager only)
  getUsers: () => get<Record<string, any>[]>({ action: 'getUsers' }),
  createUser: (data: { name: string; email: string; password: string; role: string }) =>
    post<Record<string, any>>({ action: 'createUser', ...data }),
  updateUser: (data: { id: string; name?: string; email?: string; role?: string; is_active?: boolean }) =>
    post<Record<string, any>>({ action: 'updateUser', ...data }),
  deactivateUser: (id: string) => post<Record<string, any>>({ action: 'deactivateUser', id }),
}
